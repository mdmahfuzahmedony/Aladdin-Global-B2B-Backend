INSERT INTO "BannerPlacementConfig"
    ("id", "key", "label", "description", "width", "height", "isEnabled", "updatedAt")
VALUES
    ('banner-placement-top-banner', 'TOP_BANNER', 'Top Banner', 'Promotional banner displayed at the top of the website', 1200, 100, true, CURRENT_TIMESTAMP),
    ('banner-placement-homepage-hero', 'HOMEPAGE_HERO', 'Homepage Hero', 'Main hero banner displayed on the homepage', 1920, 500, true, CURRENT_TIMESTAMP),
    ('banner-placement-flash-sale', 'FLASH_SALE', 'Flash Sale', 'Banner displayed above the Flash Sale section', 1200, 250, true, CURRENT_TIMESTAMP),
    ('banner-placement-new-arrivals', 'NEW_ARRIVALS', 'New Arrivals', 'Banner displayed above the New Arrivals section', 1200, 250, true, CURRENT_TIMESTAMP),
    ('banner-placement-best-sellers', 'BEST_SELLERS', 'Best Sellers', 'Banner displayed above the Best Sellers section', 1200, 250, true, CURRENT_TIMESTAMP),
    ('banner-placement-featured-products', 'FEATURED_PRODUCTS', 'Featured Products', 'Banner displayed above the Featured Products section', 1200, 250, true, CURRENT_TIMESTAMP),
    ('banner-placement-top-rated-products', 'TOP_RATED_PRODUCTS', 'Top Rated Products', 'Banner displayed above the Top Rated Products section', 1200, 250, true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
    "label" = EXCLUDED."label",
    "description" = EXCLUDED."description",
    "width" = EXCLUDED."width",
    "height" = EXCLUDED."height",
    "isEnabled" = true,
    "updatedAt" = CURRENT_TIMESTAMP;
