export enum PrimaryKeys {
  //============== User ==============
  ddv_users = 'user_id',
  ddv_users_auth_external = 'auth_external_id',
  ddv_user_mailing_lists = 'list_id',
  ddv_user_profiles = 'profile_id',
  ddv_user_data = 'user_data_id',
  ddv_user_loyalty = 'loyalty_id',
  ddv_user_loyalty_histories = 'auto_increment_id',

  //============== User group ==============
  ddv_usergroup_descriptions = 'list_id',
  ddv_usergroup_links = 'link_id',
  ddv_usergroup_privileges = 'usergroup_privilege_id',
  ddv_usergroups = 'usergroup_id',
  ddv_privileges = 'privilege_id',

  //============== Cart ================
  ddv_user_cart_items = 'cart_item_id',
  ddv_user_carts = 'cart_id',

  //============== Banner ==============
  ddv_banners = 'banner_id',
  ddv_banner_images = 'banner_id',
  ddv_banner_descriptions = 'banner_id',
  ddv_banner_location_descriptions = 'location_id',
  ddv_banner_target_descriptions = 'target_id',
  ddv_banner_items = 'banner_item_id',

  //============== Flash sale ==============
  ddv_flash_sales = 'flash_sale_id',
  ddv_flash_sale_details = 'detail_id',
  ddv_flash_sale_products = 'flash_sale_product_id',

  //============== Image ==============
  ddv_images = 'image_id',
  ddv_images_links = 'pair_id',

  //============== Sticker =============
  ddv_stickers = 'sticker_id',
  ddv_product_stickers = 'id',

  //============== Category ==============
  ddv_categories = 'category_id',
  ddv_category_descriptions = 'category_description_id',
  ddv_category_vendor_product_count = 'category_id',
  ddv_catalog_categories = 'catalog_id',
  ddv_catalog_category_descriptions = 'id',

  //============== Payment ==============
  ddv_payment_descriptions = 'payment_id',
  ddv_payments = 'payment_id',

  //============== Shipping ==============
  ddv_shippings = 'shipping_id',
  ddv_shipping_descriptions = 'shipping_id',
  ddv_shipping_services = 'service_id',
  ddv_shipping_service_descriptions = 'service_id',
  ddv_shipping_fees = 'shipping_fee_id',
  ddv_shipping_fee_locations = 'shipping_fee_location_id',

  //============== Promotion Accessories =============
  ddv_promotion_accessories = 'accessory_id',
  ddv_product_promotion_accessories = 'id',

  //============== Products ==============
  ddv_products_categories = 'list_id',
  ddv_products = 'product_id',
  ddv_product_descriptions = 'product_description_id',
  ddv_product_features = 'feature_id',
  ddv_product_features_descriptions = 'feature_description_id',
  ddv_product_feature_variants = 'variant_id',
  ddv_product_feature_variant_descriptions = 'variant_description_id',
  ddv_product_features_values = 'feature_value_id',
  ddv_product_point_prices = 'point_price_id',
  ddv_product_options = 'option_id',
  ddv_product_options_descriptions = 'option_description_id',
  ddv_product_options_inventory = 'product_inventory_id',
  ddv_product_option_variants = 'option_variant_id',
  ddv_product_option_variants_descriptions = 'option_variant_description_id',
  ddv_product_prices = 'product_price_id',
  ddv_product_sales = 'product_sale_id',
  ddv_product_variation_groups = 'group_id',
  ddv_product_variation_group_products = 'group_products_id',
  ddv_product_variation_group_features = 'group_feature_id',
  ddv_product_stores = 'auto_increment_id',
  ddv_product_store_histories = 'history_id',
  ddv_product_variation_index_groups = 'index_id',

  //============== Order status ==============
  ddv_statuses = 'status_id',
  ddv_status_descriptions = 'auto_increment_id',
  ddv_status_data = 'status_id',

  //============== Order ==============
  ddv_orders = 'order_id',
  ddv_order_docs = 'doc_id',
  ddv_order_data = 'order_data_id',
  ddv_order_details = 'item_id',
  ddv_order_transactions = 'payment_id',
  ddv_orders_histories = 'history_id',
  ddv_order_payment = 'order_payment_id',

  //============== Store ==============
  ddv_store_locations = 'store_location_id',
  ddv_store_location_descriptions = 'store_location_description_id',

  //============== Locator =============
  ddv_cities = 'id',
  ddv_districts = 'id',
  ddv_ward = 'id',

  //============= Comment, rating ==========
  ddv_comments = 'comment_id',
  ddv_reviews = 'review_id',
  ddv_review_comment_items = 'item_id',
  ddv_restricted_comments = 'id',
}
