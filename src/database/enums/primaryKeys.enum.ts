export enum PrimaryKeys {
  //============== User ==============
  ddv_users = 'user_id',
  ddv_users_auth_external = 'auth_external_id',
  ddv_user_mailing_lists = 'list_id',
  ddv_user_profiles = 'user_id',
  ddv_user_data = 'user_id',

  //============== User group ==============
  ddv_usergroup_descriptions = 'list_id',
  ddv_usergroup_links = 'link_id',
  ddv_usergroup_privileges = 'privilege_id',
  ddv_usergroups = 'usergroup_id',

  //============== Banner ==============
  ddv_banners = 'banner_id',
  ddv_banner_images = 'banner_id',
  ddv_banner_descriptions = 'banner_id',

  //============== Image ==============
  ddv_images = 'image_id',
  ddv_images_links = 'image_id',

  //============== Category ==============
  ddv_categories = 'category_id',
  ddv_category_descriptions = 'category_description_id',
  ddv_category_vendor_product_count = 'category_id',

  //============== Payment ==============
  ddv_payment_descriptions = 'payment_id',
  ddv_payments = 'payment_id',

  //============== Shipping ==============
  ddv_shippings = 'shipping_id',
  ddv_shipping_descriptions = 'shipping_id',
  ddv_shipping_services = 'service_id',
  ddv_shipping_service_descriptions = 'service_id',

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

  //============== Order status ==============
  ddv_statuses = 'status_id',
  ddv_status_descriptions = 'status_id',
  ddv_status_data = 'status_id',

  //============== Order ==============
  ddv_orders = 'order_id',
  ddv_order_docs = 'doc_id',
  ddv_order_data = 'order_data_id',
  ddv_order_details = 'item_id',
  ddv_order_transactions = 'payment_id',
}
