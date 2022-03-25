export enum Table {
  //============== User ==============
  USERS = 'ddv_users',
  USERS_AUTH = 'ddv_users_auth_external',
  USER_PROFILES = 'ddv_user_profiles',
  USER_MAILING_LISTS = 'ddv_user_mailing_lists',
  USER_DATA = 'ddv_user_data',
  USER_LOYALTY = 'ddv_user_loyalty',
  USER_LOYALTY_HISTORY = 'ddv_user_loyalty_histories',

  //============== User group ==============
  USER_GROUPS = 'ddv_usergroups',
  USER_GROUP_PRIVILEGES = 'ddv_usergroup_privileges',
  USER_GROUP_DESCRIPTIONS = 'ddv_usergroup_descriptions',
  USER_GROUP_LINKS = 'ddv_usergroup_links',
  PRIVILEGES = 'ddv_privileges',

  //============== Category ==============
  CATEGORIES = 'ddv_categories',
  CATEGORY_DESCRIPTIONS = 'ddv_category_descriptions',
  CATEGORY_VENDOR_PRODUCT_COUNT = 'ddv_category_vendor_product_count',

  //============== Banner ==============
  BANNER = 'ddv_banners',
  BANNER_IMAGE = 'ddv_banner_images',
  BANNER_DESCRIPTIONS = 'ddv_banner_descriptions',
  BANNER_LOCATION_DESCRIPTION = 'ddv_banner_location_descriptions',
  BANNER_TARGET_DESCRIPTION = 'ddv_banner_target_descriptions',
  BANNER_ITEM = 'ddv_banner_items',

  //============== Image ==============
  IMAGE = 'ddv_images',
  IMAGE_LINK = 'ddv_images_links',

  //============== Sticker =============
  STICKER = 'ddv_stickers',

  //============== Payment ==============
  PAYMENT_DESCRIPTION = 'ddv_payment_descriptions',
  PAYMENT = 'ddv_payments',

  //============== Shipping ==============
  SHIPPINGS = 'ddv_shippings',
  SHIPPINGS_DESCRIPTION = 'ddv_shipping_descriptions',
  SHIPPING_SERVICE = 'ddv_shipping_services',
  SHIPPING_SERVICE_DESCRIPTION = 'ddv_shipping_service_descriptions',

  //============== Cart ===============
  CART = 'ddv_user_carts',
  CART_ITEMS = 'ddv_user_cart_items',

  //============== Products ==============
  PRODUCTS_CATEGORIES = 'ddv_products_categories',
  PRODUCTS = 'ddv_products',
  PRODUCT_DESCRIPTION = 'ddv_product_descriptions',
  PRODUCT_FEATURES = 'ddv_product_features',
  PRODUCT_FEATURE_DESCRIPTIONS = 'ddv_product_features_descriptions',
  PRODUCT_FEATURES_VARIANTS = 'ddv_product_feature_variants',
  PRODUCT_FEATURES_VARIANT_DESCRIPTIONS = 'ddv_product_feature_variant_descriptions',
  PRODUCT_FEATURE_VALUES = 'ddv_product_features_values',
  PRODUCT_POINT_PRICES = 'ddv_product_point_prices',
  PRODUCT_OPTIONS = 'ddv_product_options',
  PRODUCT_OPTIONS_DESCRIPTIONS = 'ddv_product_options_descriptions',
  PRODUCT_OPTIONS_INVENTORY = 'ddv_product_options_inventory',
  PRODUCT_OPTIONS_VARIANTS = 'ddv_product_option_variants',
  PRODUCT_OPTIONS_VARIANT_DESCRIPTIONS = 'ddv_product_option_variants_descriptions',
  PRODUCT_PRICES = 'ddv_product_prices',
  PRODUCT_SALES = 'ddv_product_sales',
  PRODUCT_VARIATION_GROUPS = 'ddv_product_variation_groups',
  PRODUCT_VARIATION_GROUP_PRODUCTS = 'ddv_product_variation_group_products',
  PRODUCT_VARIATION_GROUP_FEATURES = 'ddv_product_variation_group_features',
  PRODUCT_STORES = 'ddv_product_stores',
  PRODUCT_STORE_HISTORIES = 'ddv_product_store_histories',

  //============== Order status ==============
  ORDER_STATUS = 'ddv_statuses',
  ORDER_STATUS_DESCRIPTION = 'ddv_status_descriptions',
  ORDER_STATUS_DATA = 'ddv_status_data',

  //============== Status ===============
  STATUS = 'ddv_statuses',
  STATUS_DESCRIPTION = 'ddv_status_descriptions',
  STATUS_DATA = 'ddv_status_data',

  //============== Order ==============
  ORDERS = 'ddv_orders',
  ORDER_DOCS = 'ddv_order_docs',
  ORDER_DATA = 'ddv_order_data',
  ORDER_DETAILS = 'ddv_order_details',
  ORDER_TRANSACTIONS = 'ddv_order_transactions',
  ORDER_HISTORIES = 'ddv_orders_histories',

  //============== Store ==============
  STORE_LOCATIONS = 'ddv_store_locations',
  STORE_LOCATION_DESCRIPTIONS = 'ddv_store_location_descriptions',

  //============== Locator ===========
  CITIES = 'ddv_cities',
  DISTRICTS = 'ddv_districts',
  WARDS = 'ddv_wards',
}
