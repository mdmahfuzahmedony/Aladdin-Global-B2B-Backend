import { prisma } from "../config/prisma";

type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  entityId,
  entityType,
}: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityId: entityId || null,
        entityType: entityType || null,
        isRead: false,
      },
    });

    return notification;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return null;
  }
};

export const notifyAdmins = async ({
  type,
  title,
  message,
  entityId,
  entityType,
}: Omit<CreateNotificationParams, "userId">) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "MANAGER"] },
      },
      select: { id: true },
    });

    if (!admins.length) return;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type,
        title,
        message,
        entityId: entityId || null,
        entityType: entityType || null,
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("NOTIFY ADMINS ERROR:", error);
  }
};
