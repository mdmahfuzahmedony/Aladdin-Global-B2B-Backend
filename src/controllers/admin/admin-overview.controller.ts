import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth-middleware";

function formatCurrency(amount: number): string {
  return "৳" + Math.round(amount).toLocaleString("en-BD");
}

export const getAdminOverview = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Parallel base counts and totals
    const [
      allOrders,
      todayOrdersCount,
      yesterdayOrders,
      thisMonthOrders,
      lastMonthOrders,
      pendingVendorsCount,
      activeVendorsCount,
      newVendorsThisWeekCount,
      pendingWholesalersCount,
      pendingReviewsCount,
      pendingPayoutsCount,
      lowStockProductsCount,
      earningsAggregate,
      wholesalersCredit,
      activityLogs,
    ] = await Promise.all([
      // All customer orders
      prisma.customerOrder.findMany({
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              productTitle: true,
              quantity: true,
              totalPrice: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              vendor: {
                select: {
                  id: true,
                  storeName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Today orders count
      prisma.customerOrder.count({
        where: { createdAt: { gte: todayStart } },
      }),

      // Yesterday orders
      prisma.customerOrder.findMany({
        where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
        select: { totalAmount: true },
      }),

      // This month orders
      prisma.customerOrder.findMany({
        where: { createdAt: { gte: monthStart } },
        select: { totalAmount: true },
      }),

      // Last month orders
      prisma.customerOrder.findMany({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        select: { totalAmount: true },
      }),

      // Pending Vendors
      prisma.vendor.count({ where: { status: "PENDING" } }),

      // Active Vendors
      prisma.vendor.count({ where: { status: "APPROVED" } }),

      // New Vendors this week
      prisma.vendor.count({
        where: {
          status: "APPROVED",
          createdAt: { gte: weekStart },
        },
      }),

      // Pending Wholesalers
      prisma.wholesaler.count({ where: { verificationStatus: "PENDING" } }),

      // Pending Product Reviews
      prisma.productReview.count({ where: { status: "PENDING" } }),

      // Pending Payouts
      prisma.vendorPayoutTransaction.count({ where: { status: "PENDING" } }),

      // Low Stock Products
      prisma.product.count({ where: { stockQuantity: { lte: 10 } } }),

      // Commission Earnings
      prisma.vendorEarning.aggregate({
        _sum: { commissionAmount: true },
      }),

      // Wholesalers Credit/Due
      prisma.wholesaler.aggregate({
        _sum: { creditLimit: true },
      }),

      // Recent Activity Logs
      prisma.activityLog.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // 2. Calculate Revenue Metrics
    const todayOrdersList = allOrders.filter(
      (o) => new Date(o.createdAt) >= todayStart
    );
    const todaySales = todayOrdersList.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    const yesterdaySales = yesterdayOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    const thisMonthSales = thisMonthOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    const lastMonthSales = lastMonthOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    // Trend calculation
    let todayTrendText = "+0% গতকাল থেকে";
    let todayTrendPositive = true;
    if (yesterdaySales > 0) {
      const diff = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
      todayTrendPositive = diff >= 0;
      todayTrendText = `${diff >= 0 ? "+" : ""}${Math.round(diff)}% গতকাল থেকে`;
    } else if (todaySales > 0) {
      todayTrendText = "+100% গতকাল থেকে";
    }

    let monthTrendText = "+0% গত মাস থেকে";
    let monthTrendPositive = true;
    if (lastMonthSales > 0) {
      const diff = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
      monthTrendPositive = diff >= 0;
      monthTrendText = `${diff >= 0 ? "+" : ""}${Math.round(diff)}% গত মাস থেকে`;
    } else if (thisMonthSales > 0) {
      monthTrendText = "+100% গত মাস থেকে";
    }

    const totalOrdersCount = allOrders.length;
    const pendingApprovalsCount =
      pendingVendorsCount +
      pendingWholesalersCount +
      pendingReviewsCount +
      pendingPayoutsCount;

    const commissionIncome = Number(earningsAggregate._sum.commissionAmount || 0);
    const wholesalerDue = Number(wholesalersCredit._sum.creditLimit || 0);

    // 3. Top Performers Calculation
    const productSalesMap = new Map<
      string,
      { title: string; image: string | null; count: number; revenue: number }
    >();

    const vendorSalesMap = new Map<
      string,
      { storeName: string; count: number; total: number }
    >();

    const categorySalesMap = new Map<string, number>();

    for (const order of allOrders) {
      for (const item of order.items) {
        // Product
        const pId = item.productId || item.productTitle;
        const currentProd = productSalesMap.get(pId) || {
          title: item.productTitle || item.product?.title || "Product",
          image: item.product?.images?.[0] || null,
          count: 0,
          revenue: 0,
        };
        currentProd.count += item.quantity;
        currentProd.revenue += Number(item.totalPrice || 0);
        productSalesMap.set(pId, currentProd);

        // Vendor
        if (item.vendor) {
          const vId = item.vendor.id;
          const currentVen = vendorSalesMap.get(vId) || {
            storeName: item.vendor.storeName || "Seller Store",
            count: 0,
            total: 0,
          };
          currentVen.count += 1;
          currentVen.total += Number(item.totalPrice || 0);
          vendorSalesMap.set(vId, currentVen);
        }

        // Category
        const catName = item.product?.category?.name || "General";
        categorySalesMap.set(
          catName,
          (categorySalesMap.get(catName) || 0) + Number(item.totalPrice || 0)
        );
      }
    }

    // Best selling product
    const sortedProducts = Array.from(productSalesMap.values()).sort(
      (a, b) => b.count - a.count
    );
    let topProduct = sortedProducts[0] || null;

    if (!topProduct) {
      // Fallback: pick any active product
      const fallbackProd = await prisma.product.findFirst({
        select: { title: true, images: true },
      });
      if (fallbackProd) {
        topProduct = {
          title: fallbackProd.title,
          image: fallbackProd.images?.[0] || null,
          count: 0,
          revenue: 0,
        };
      }
    }

    // Top vendor
    const sortedVendors = Array.from(vendorSalesMap.values()).sort(
      (a, b) => b.total - a.total
    );
    let topSeller = sortedVendors[0] || null;

    if (!topSeller) {
      const fallbackVendor = await prisma.vendor.findFirst({
        where: { status: "APPROVED" },
        select: { storeName: true },
      });
      if (fallbackVendor) {
        topSeller = {
          storeName: fallbackVendor.storeName,
          count: 0,
          total: 0,
        };
      }
    }

    // Top affiliate
    const topAffiliateRecord = await prisma.affiliate.findFirst({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });

    const topAffiliate = {
      name:
        topAffiliateRecord?.user?.fullName ||
        topAffiliateRecord?.user?.email?.split("@")[0] ||
        "No affiliate yet",
      totalEarnings: 0,
    };

    // 4. Revenue Trend (Last 7 Months)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const last7Months: { month: string; value: string; rawValue: number; height: string }[] = [];
    let maxMonthVal = 1;

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const mEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const mName = monthNames[targetDate.getMonth()];

      const monthOrders = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= mStart && d <= mEnd;
      });

      const total = monthOrders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
      if (total > maxMonthVal) {
        maxMonthVal = total;
      }

      let valStr = "৳0";
      if (total >= 1000) {
        valStr = `${(total / 1000).toFixed(1)}k`;
      } else if (total > 0) {
        valStr = `৳${total}`;
      }

      last7Months.push({
        month: mName,
        value: valStr,
        rawValue: total,
        height: "10%",
      });
    }

    // Scale heights proportionally (minimum 15%, max 85%)
    for (const m of last7Months) {
      if (maxMonthVal > 0 && m.rawValue > 0) {
        const pct = Math.max(15, Math.min(90, Math.round((m.rawValue / maxMonthVal) * 85)));
        m.height = `${pct}%`;
      } else {
        m.height = "12%";
      }
    }

    // 5. Order Status Breakdown
    const statusCounts = {
      completed: 0,
      processing: 0,
      pending: 0,
      cancelled: 0,
    };

    for (const o of allOrders) {
      const s = String(o.status).toUpperCase();
      if (s === "DELIVERED") {
        statusCounts.completed++;
      } else if (["PROCESSING", "CONFIRMED", "PACKED", "SHIPPED"].includes(s)) {
        statusCounts.processing++;
      } else if (["PENDING", "RETURN_REQUESTED"].includes(s)) {
        statusCounts.pending++;
      } else if (["CANCELLED", "RETURNED", "REFUNDED"].includes(s)) {
        statusCounts.cancelled++;
      } else {
        statusCounts.pending++;
      }
    }

    const totalOrdersStatus = Math.max(1, allOrders.length);
    const orderStatusBreakdown = [
      {
        name: "Completed",
        count: statusCounts.completed,
        percent: `${Math.round((statusCounts.completed / totalOrdersStatus) * 100)}%`,
        color: "bg-emerald-500",
      },
      {
        name: "Processing",
        count: statusCounts.processing,
        percent: `${Math.round((statusCounts.processing / totalOrdersStatus) * 100)}%`,
        color: "bg-blue-500",
      },
      {
        name: "Pending",
        count: statusCounts.pending,
        percent: `${Math.round((statusCounts.pending / totalOrdersStatus) * 100)}%`,
        color: "bg-amber-400",
      },
      {
        name: "Cancelled",
        count: statusCounts.cancelled,
        percent: `${Math.round((statusCounts.cancelled / totalOrdersStatus) * 100)}%`,
        color: "bg-red-400",
      },
    ];

    // 6. Sales by Category
    const categoryColors = [
      "bg-blue-500",
      "bg-violet-500",
      "bg-orange-400",
      "bg-pink-500",
      "bg-cyan-500",
      "bg-emerald-500",
    ];

    let totalCatSales = Array.from(categorySalesMap.values()).reduce((a, b) => a + b, 0);
    let salesByCategory: { name: string; percent: string; color: string; sales: number }[] = [];

    if (categorySalesMap.size > 0 && totalCatSales > 0) {
      salesByCategory = Array.from(categorySalesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, sales], index) => ({
          name,
          sales,
          percent: `${Math.round((sales / totalCatSales) * 100)}%`,
          color: categoryColors[index % categoryColors.length],
        }));
    } else {
      // Fallback: list existing DB categories
      const dbCategories = await prisma.category.findMany({
        take: 5,
        select: { name: true },
      });
      salesByCategory = dbCategories.map((c, i) => ({
        name: c.name,
        sales: 0,
        percent: "0%",
        color: categoryColors[i % categoryColors.length],
      }));
    }

    // 7. Revenue Split
    const totalPlatformSales = allOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );

    // 8. Action Items
    const actionItems = [
      {
        label: "Seller approval বাকি",
        count: pendingVendorsCount,
        link: "/admin/vendors",
      },
      {
        label: "Wholesaler verification বাকি",
        count: pendingWholesalersCount,
        link: "/admin/users?role=WHOLESALER",
      },
      {
        label: "Product review বাকি",
        count: pendingReviewsCount,
        link: "/admin/products",
      },
      {
        label: "Payout request বাকি",
        count: pendingPayoutsCount,
        link: "/admin/finance",
      },
    ];

    return res.status(200).json({
      success: true,
      message: "Admin overview fetched successfully",
      data: {
        stats: {
          todaySales: formatCurrency(todaySales),
          todaySalesRaw: todaySales,
          todaySalesTrend: {
            value: todayTrendText,
            positive: todayTrendPositive,
          },
          monthSales: formatCurrency(thisMonthSales),
          monthSalesRaw: thisMonthSales,
          monthSalesTrend: {
            value: monthTrendText,
            positive: monthTrendPositive,
          },
          todayOrdersCount,
          totalOrdersCount,
          pendingApprovalsCount,
          commissionIncome: formatCurrency(commissionIncome),
          activeSellersCount: activeVendorsCount,
          newSellersThisWeekCount: newVendorsThisWeekCount,
          wholesalerDue: formatCurrency(wholesalerDue),
          lowStockProductsCount,
          totalPlatformSales: formatCurrency(totalPlatformSales),
        },
        actionItems,
        topPerformers: {
          bestSellingProduct: topProduct
            ? {
                title: topProduct.title,
                count: topProduct.count,
                revenue: formatCurrency(topProduct.revenue),
                image: topProduct.image,
              }
            : null,
          topSeller: topSeller
            ? {
                storeName: topSeller.storeName,
                total: formatCurrency(topSeller.total),
                count: topSeller.count,
              }
            : null,
          topAffiliate,
        },
        revenueTrend: last7Months,
        orderStatusBreakdown,
        salesByCategory,
        revenueSplit: {
          total: formatCurrency(totalPlatformSales),
          sellerSalesPercent: 100,
          wholesalerSalesPercent: 0,
          affiliateSalesPercent: 0,
        },
        recentActivities: activityLogs,
      },
    });
  } catch (error: any) {
    console.error("GET ADMIN OVERVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch admin overview",
    });
  }
};
