import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import { Table, JoinTable, SortBy } from '../../database/enums/index';

import { UpdateCustomerDTO } from '../dto/customer/update-customer.dto';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderEntity } from '../entities/orders.entity';
import { OrderDetailsRepository } from '../repositories/orderDetails.repository';
import { OrderDetailsEntity } from '../entities/orderDetails.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { UpdateOrderDto } from '../dto/orders/update-order.dto';
import { CreateOrderDto } from '../dto/orders/create-order.dto';
import { convertDataToIntegrate } from 'src/database/constant/order';
import axios from 'axios';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import {
  ordersByCustomerFilter,
  orderSearchFilter,
} from 'src/utils/tableConditioner';
import { Like } from 'src/database/find-options/operators';
import { StatusRepository } from '../repositories/status.repository';
import { StatusEntity } from '../entities/status.entity';
import { StatusType, CommonStatus } from '../../database/enums/status.enum';
import {
  orderDetailsJoiner,
  orderJoiner,
  productLeftJoiner,
  statusJoiner,
} from '../../utils/joinTable';
import {
  convertOrderDataFromAppcore,
  itgOrderFromAppcore,
  mappingStatusOrder,
} from 'src/utils/integrateFunctions';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
import e from 'express';
import { sortBy } from 'lodash';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';

import { LocatorService } from './locator.service';
import { CityRepository } from '../repositories/city.repository';
import { CityEntity } from '../entities/cities.entity';
import { DistrictRepository } from '../repositories/district.repository';
import { DistrictEntity } from '../entities/districts.entity';
import { WardRepository } from '../repositories/ward.repository';
import { WardEntity } from '../entities/wards.entity';
import { CreateOrderAppcoreDto } from '../dto/orders/create-order.appcore.dto';
import { UpdateOrderAppcoreDto } from '../dto/orders/update-order.appcore.dto';
import {
  GET_ORDERS_FROM_APPCORE_API,
  GET_ORDER_BY_ID_FROM_APPCORE_API,
  PUSH_ORDER_TO_APPCORE_API,
} from 'src/database/constant/api.appcore';
import { saltHashPassword } from 'src/utils/cipherHelper';
import { defaultPassword } from '../../database/constant/defaultPassword';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserDataEntity } from '../entities/userData.entity';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { CustomerService } from './customer.service';
import { CreateOrderFEDto } from '../dto/orders/create-order.frontend.dto';
import { CartRepository } from '../repositories/cart.repository';
import { CartEntity } from '../entities/cart.entity';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { CartItemEntity } from '../entities/cartItem.entity';
import { productSearchJoiner } from '../../utils/joinTable';
import { OrderHistoryRepository } from '../repositories/orderHistory.repository';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';
import { convertToMySQLDateTime } from '../../utils/helper';
import { PromotionService } from './promotion.service';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrdersRepository<OrderEntity>,
    private orderDetailRepo: OrderDetailsRepository<OrderDetailsEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private userProfileRepo: UserProfileRepository<UserProfileEntity>,
    private userDataRepo: UserDataRepository<UserDataEntity>,
    private userLoyaltyRepo: UserLoyaltyRepository<UserLoyaltyEntity>,
    private userRepo: UserRepository<UserEntity>,
    private statusRepo: StatusRepository<StatusEntity>,
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private cityRepo: CityRepository<CityEntity>,
    private districtRepo: DistrictRepository<DistrictEntity>,
    private wardRepo: WardRepository<WardEntity>,
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private customerService: CustomerService,
    private orderHistoryRepo: OrderHistoryRepository<OrderHistoryEntity>,
    private locatorService: LocatorService,
    private promotionService: PromotionService,
  ) {}

  async CMScreate(data: CreateOrderDto) {
    let user: any = await this.userRepo.findById(data.user_id);
    if (!user) {
      user = await this.userRepo.findOne({ phone: data.b_phone });
      // Nếu không có thông tin user thì sẽ tạo mới
      if (!user) {
        user = await this.createCustomer(data);
      }
    }

    await this.createOrder(user, data);
  }

  async FEcreate(data: CreateOrderFEDto, userAuth) {
    let user = await this.userRepo.findOne({ user_id: userAuth.user_id });

    if (!user['user_appcore_id']) {
      await this.customerService.createCustomerToAppcore(user);
      user = await this.userRepo.findOne({ user_id: userAuth.user_id });
    }

    if (!user) {
      throw new HttpException(
        'Có lỗi trong quá trình tạo đơn hàng, vui lòng liên hệ quản trị viên',
        400,
      );
    }

    const cart = await this.cartRepo.findOne({ user_id: user.user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    const cartItems = await this.cartItemRepo.find({
      select: 'product_id, amount',
      where: { cart_id: cart.cart_id },
    });

    if (!cartItems.length) {
      throw new HttpException('Không tìm thấy sản phẩm trong giỏ hàng', 404);
    }

    let userProfile = await this.userProfileRepo.findOne({
      user_id: user.user_id,
    });

    // await this.createOrder(user, sendData);
    userProfile['s_firstname'] = '';
    userProfile['s_lastname'] = data.s_lastname || userProfile['s_lastname'];
    userProfile['s_phone'] = data.s_phone || userProfile['s_phone'];
    userProfile['s_city'] = data.s_city || userProfile['s_city'];
    userProfile['s_district'] = data.s_district || userProfile['s_district'];
    userProfile['s_ward'] = data.s_ward || userProfile['s_ward'];
    userProfile['s_address'] = data.s_address || userProfile['s_address'];

    userProfile = await this.userProfileRepo.update(
      { user_id: user.user_id },
      userProfile,
    );

    const sendData = { ...userProfile, order_items: cartItems };

    await this.createOrder(user, sendData);

    await this.cartRepo.delete({ cart_id: cart.cart_id });
    await this.cartItemRepo.delete({ cart_id: cart.cart_id });
  }

  async createOrder(user, data) {
    data['store_id'] = data['store_id'] || 67107;
    data['utm_source'] = data['utm_source'] || 10;

    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
    };

    if (!user['user_appcore_id']) {
      throw new HttpException('User_appcore_id không được nhận diện.', 400);
    }

    orderData['user_appcore_id'] = user['user_appcore_id'];
    orderData['user_id'] = user['user_id'];

    orderData['total'] = 0;
    for (let orderItem of data.order_items) {
      const productInfo = await this.productRepo.findOne({
        select: `*, ${Table.PRODUCT_PRICES}.*`,
        join: productLeftJoiner,
        where: { [`${Table.PRODUCTS}.product_id`]: orderItem.product_id },
      });

      if (
        productInfo?.parent_product_id == 0 ||
        !productInfo?.parent_product_id
      ) {
        throw new HttpException('Không thể dùng SP cha', 401);
      }

      if (!productInfo) {
        throw new HttpException(
          `Không tìm thấy sản phẩm có id ${orderItem.product_id}`,
          404,
        );
      }

      orderData['total'] +=
        (productInfo['price'] *
          orderItem.amount *
          (100 - productInfo['percentage_discount'])) /
        100;
    }

    orderData['total'] =
      orderData['discount_type'] == 1
        ? orderData['total'] - orderData['discount']
        : (orderData['total'] * (100 - orderData['discount'])) / 100;

    if (data['coupon_code']) {
      //Check coupon
      let checkCouponData = {
        store_id: data['store_id'],
        coupon_code: data['coupon_code'],
        coupon_programing_id: data['coupon_programing_id'],
        phone: data['b_phone'] ? data['b_phone'] : data['s_phone'],
        products: data['order_items'].map(({ product_id, amount }) => ({
          product_id,
          amount,
        })),
      };

      let checkResult = await this.promotionService.checkCoupon(
        checkCouponData,
      );

      if (checkResult['isValid']) {
        orderData['total'] -= checkResult['discountMoney'];
      }
    }

    let result = await this.orderRepo.create(orderData);

    // create order histories
    const orderHistoryData = { ...new OrderHistoryEntity(), ...result };
    await this.orderHistoryRepo.create(orderHistoryData);

    for (let orderItem of data['order_items']) {
      const orderProductItem = await this.productRepo.findOne({
        select: `*, ${Table.PRODUCT_PRICES}.*`,
        join: productLeftJoiner,
        where: { [`${Table.PRODUCTS}.product_id`]: orderItem['product_id'] },
      });

      let orderDetailData = {
        ...new OrderDetailsEntity(),
        ...this.orderDetailRepo.setData({
          ...result,
          ...orderItem,
          product_id: orderProductItem.product_id,
          product_appcore_id: orderProductItem.product_appcore_id,
          price: orderProductItem['price'],
          status: CommonStatus.Active,
        }),
      };

      let newOrderDetail = await this.orderDetailRepo.create(orderDetailData);

      result['order_items'] = result['order_items']
        ? [
            ...result['order_items'],
            {
              ...newOrderDetail,
              product_id: newOrderDetail.product_appcore_id,
            },
          ]
        : [
            {
              ...newOrderDetail,
              product_id: newOrderDetail.product_appcore_id,
            },
          ];
    }

    console.log(convertDataToIntegrate(result));

    //============ Push data to Appcore ==================
    const configPushOrderToAppcore: any = {
      method: 'POST',
      url: PUSH_ORDER_TO_APPCORE_API,
      headers: {
        'Content-Type': 'application/json',
      },
      data: convertDataToIntegrate(result),
    };

    try {
      const response = await axios(configPushOrderToAppcore);

      const orderAppcoreResponse = response.data.data;
      const updatedOrder = await this.orderRepo.update(
        { order_id: result.order_id },
        {
          order_code: orderAppcoreResponse.orderId,
          is_sync: 0,
          updated_date: convertToMySQLDateTime(),
        },
      );
      for (let orderItem of orderAppcoreResponse['orderItemIds']) {
        await this.orderDetailRepo.update(
          {
            order_id: result.order_id,
            product_appcore_id: orderItem.productId,
          },
          { order_item_appcore_id: orderItem.orderItemId },
        );
      }
      // update order history
      await this.orderHistoryRepo.create(updatedOrder);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Có lỗi xảy ra trong quá trình đưa dữ liệu lên AppCore : ${
          error?.response?.data?.message || error.message
        }`,
        400,
      );
    }
  }

  async createCustomer(data: CreateOrderDto) {
    const { passwordHash, salt } = saltHashPassword(defaultPassword);
    const userData = {
      ...new UserEntity(),
      birthday: null,
      firstname: data.b_firstname,
      lastname: data.b_lastname,
      phone: data.b_phone,
      password: passwordHash,
      salt,
    };

    let result = await this.userRepo.create(userData);

    const userProfileData = {
      ...new UserProfileEntity(),
      ...this.userProfileRepo.setData(data),
      user_id: result.user_id,
    };
    userProfileData['b_firstname'] = userProfileData['s_firstname'];
    userProfileData['b_lastname'] = userProfileData['b_lastname'];
    userProfileData['b_city'] = userProfileData['s_city'];
    userProfileData['b_district'] = userProfileData['s_district'];
    userProfileData['b_ward'] = userProfileData['s_ward'];

    const newUserProfile = await this.userProfileRepo.create(userProfileData);

    result = { ...result, ...newUserProfile };

    const newUserDataData = {
      ...new UserDataEntity(),
      user_id: result.user_id,
    };

    const newUserData = await this.userDataRepo.create(newUserDataData);

    const newUserLoyaltyData = {
      ...new UserLoyaltyEntity(),
      user_id: result.user_id,
    };

    const newUserLoyalty = await this.userLoyaltyRepo.create(
      newUserLoyaltyData,
    );

    await this.customerService.createCustomerToAppcore(result);

    return this.userRepo.findOne({ user_id: result.user_id });
  }

  async update(order_id: number, data) {
    const order = await this.orderRepo.findById(order_id);

    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }
    let result = { ...order };
    const orderData = this.orderRepo.setData(data);

    if (Object.entries(orderData).length) {
      const updatedOrder = await this.orderRepo.update(
        { order_id: order.order_id },
        orderData,
      );
      result = { ...result, ...updatedOrder };
    }

    if (data?.order_items?.length) {
      for (let orderItem of data.order_items) {
        if (!orderItem.product_id && !orderItem.item_id) continue;

        if (orderItem.item_id) {
          const currentOrderItem = await this.orderDetailRepo.findOne({
            where: [{ item_id: orderItem.item_id }],
          });

          if (
            currentOrderItem &&
            currentOrderItem.order_id == result.order_id
          ) {
            const orderItemData = this.orderDetailRepo.setData({
              ...orderItem,
              status: 'A',
            });
            if (orderItem.deleted) {
              await this.orderDetailRepo.update(
                { item_id: orderItem.item_id },
                { ...orderItemData, status: 'D' },
              );
            } else {
              if (Object.entries(orderItemData).length) {
                await this.orderDetailRepo.update(
                  { item_id: orderItem.item_id },
                  { ...orderItemData },
                );
              }
            }
          }
        } else {
          const currentOrderItem = await this.orderDetailRepo.findOne({
            product_id: orderItem.product_id,
            order_id: result.order_id,
          });

          if (currentOrderItem) {
            const orderItemData = this.orderDetailRepo.setData({
              ...orderItem,
              status: 'A',
            });

            if (orderItem.deleted) {
              await this.orderDetailRepo.update(
                { item_id: currentOrderItem.item_id },
                { ...orderItemData, status: 'D' },
              );
            } else {
              if (Object.entries(orderItemData).length) {
                await this.orderDetailRepo.update(
                  { item_id: currentOrderItem.item_id },
                  { ...orderItemData },
                );
              }
            }
            continue;
          }

          const newOrderItemData = {
            ...new OrderDetailsEntity(),
            ...this.orderDetailRepo.setData(orderItem),
            order_id: result.order_id,
            status: 'A',
          };
          await this.orderDetailRepo.create(newOrderItemData);
        }
      }
    }
  }

  async syncGet() {
    try {
      const response = await axios({
        url: `${GET_ORDERS_FROM_APPCORE_API}?page=10`,
      });
      if (!response) {
        throw new HttpException('không tìm thấy db', 404);
      }
      const ordersData = response?.data?.data;

      if (ordersData) {
        for (let order of ordersData) {
          const itgOrder = itgOrderFromAppcore(order);
          const orderData = {
            ...new OrderEntity(),
            ...this.orderRepo.setData(itgOrder),
          };
          await this.orderRepo.createSync(orderData);

          if (order?.orderItems?.length) {
            for (let orderItem of order.orderItems) {
              const itgOrderItem = {
                ...new OrderDetailsEntity(),
                ...this.orderDetailRepo.setData(orderItem),
              };
              await this.orderDetailRepo.createSync(itgOrderItem);
            }
          }
        }
      }
    } catch (error) {
      throw new HttpException('Có lỗi xảy ra', 422);
    }
  }

  async itgGet(order_code) {
    const order = await this.orderRepo.findOne({ order_code });
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }

    const orderItems = await this.orderDetailRepo.find({
      order_id: order.order_id,
    });
    if (orderItems.length) {
      for (let orderItem of orderItems) {
        const product = await this.productRepo.findOne({
          select: `product`,
          join: productSearchJoiner,
          where: [
            { [`${Table.PRODUCTS}.product_id`]: orderItem.product_id },
            { product_appcore_id: orderItem.product_id },
          ],
        });
        if (product) {
          const productImageLink = await this.imageLinkRepo.findOne({
            object_type: ImageObjectType.PRODUCT,
            object_id: product.product_id,
          });
          if (productImageLink) {
            const productImage = await this.imageRepo.findOne({
              image_id: productImageLink.image_id,
            });
            product['image'] = { ...productImageLink, ...productImage };
          }
        }
        orderItem = { ...orderItem, ...product };
        order['order_items'] = order['order_items']
          ? [...order['order_items'], orderItem]
          : [orderItem];
      }
    }

    return order;
  }

  async itgCreate(data: CreateOrderAppcoreDto) {
    console.log('create');
    console.log(data);
    const convertedData = convertOrderDataFromAppcore(data);
    console.log(convertedData);
    const order = await this.orderRepo.findOne({
      order_code: convertedData.order_code,
    });
    if (order) {
      throw new HttpException(
        'Mã đơn hàng từ Appcore đã tồn tại trong hệ thống',
        409,
      );
    }

    if (convertedData.status) {
      convertedData['status'] = mappingStatusOrder(convertedData['status']);
    }

    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(convertedData),
      is_sync: 0,
    };

    orderData['total'] = 0;

    if (convertedData['order_items'] && convertedData['order_items'].length) {
      for (let orderItem of convertedData['order_items']) {
        const orderDetail = await this.orderDetailRepo.findOne({
          order_item_appcore_id: orderItem.order_item_appcore_id,
        });
        if (orderDetail) {
          throw new HttpException('Mã chi tiết đơn hàng đã tồn tại', 409);
        }
        orderData['total'] +=
          orderData['discount_type'] == 1
            ? orderItem['price'] * orderItem['amount'] - orderItem['discount']
            : (orderData['price'] *
                orderItem['amount'] *
                (100 - orderItem['discount'])) /
              100;
      }
    }

    const user = await this.userRepo.findOne({
      user_appcore_id: convertedData.user_appcore_id,
    });
    if (user) {
      orderData['user_id'] = user.user_id;
    }

    let result = await this.orderRepo.create(orderData);

    // create order histories
    const orderHistoryData = { ...new OrderHistoryEntity(), ...result };
    await this.orderHistoryRepo.create(orderHistoryData);

    if (convertedData['order_items'] && convertedData['order_items'].length) {
      for (let orderItem of convertedData['order_items']) {
        let orderDetailData = {
          ...new OrderDetailsEntity(),
          ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
          product_appcore_id: orderItem['product_id'],
        };

        const newOrderDetail = await this.orderDetailRepo.create(
          orderDetailData,
        );

        result['order_items'] = result['order_items']
          ? [...result['order_items'], newOrderDetail]
          : [newOrderDetail];
      }
    }
    return result;
  }

  async itgUpdate(order_code: string, data: UpdateOrderAppcoreDto) {
    console.log('update');

    const convertedData = convertOrderDataFromAppcore(data);

    const order = await this.orderRepo.findOne({ order_code });
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }

    let result = { ...order };

    if (convertedData.status) {
      convertedData['status'] = mappingStatusOrder(convertedData.status);
    }

    const orderData = await this.orderRepo.setData({ ...convertedData });

    if (convertedData.user_appcore_id) {
      const user = await this.userRepo.findOne({
        user_appcore_id: convertedData.user_appcore_id,
      });
      if (user) {
        orderData['user_id'] = user.user_id;
      }
    }

    if (Object.entries(orderData).length) {
      const updatedOrder = await this.orderRepo.update(
        { order_code },
        orderData,
      );
      result = { ...result, ...updatedOrder };

      // create order histories
      const orderHistoryData = { ...new OrderHistoryEntity(), ...result };
      await this.orderHistoryRepo.create(orderHistoryData);
    }

    const orderItemsList = await this.orderDetailRepo.find({
      select: '*',
      where: { order_id: order.order_id },
    });

    if (convertedData['order_items'] && convertedData['order_items'].length) {
      let willRemoveOrderItems = [];
      let willAddNewOrderItems = [];
      let willUpdateOrderItems = [];
      for (let orderItem of convertedData.order_items) {
        if (
          !orderItemsList.some(
            ({ order_item_appcore_id }) =>
              order_item_appcore_id === orderItem.order_item_appcore_id,
          )
        ) {
          willAddNewOrderItems = [...willAddNewOrderItems, orderItem];
        } else {
          willUpdateOrderItems = [...willUpdateOrderItems, orderItem];
        }
      }
      willRemoveOrderItems = orderItemsList.filter(
        ({ order_item_appcore_id }) =>
          !willUpdateOrderItems.some(
            (orderItem) =>
              orderItem.order_item_appcore_id === order_item_appcore_id,
          ),
      );

      console.log(`will Add:`, willAddNewOrderItems);
      console.log(`will Update:`, willUpdateOrderItems);
      console.log(`will Remove:`, willRemoveOrderItems);

      for (let orderItem of willRemoveOrderItems) {
        await this.orderDetailRepo.delete({
          order_item_appcore_id: orderItem.order_item_appcore_id,
        });
      }

      for (let orderItem of willUpdateOrderItems) {
        await this.orderDetailRepo.update(
          { order_item_appcore_id: orderItem.order_item_appcore_id },
          orderItem,
        );
      }

      for (let orderItem of willAddNewOrderItems) {
        const orderItemData = {
          ...new OrderDetailsEntity(),
          ...this.orderDetailRepo.setData(orderItem),
          product_appcore_id: orderItem['product_id'],
          order_id: order.order_id,
        };
        await this.orderDetailRepo.create(orderItemData);
      }

      const updatedOrderItems = await this.orderDetailRepo.find({
        select: '*',
        where: { order_id: order.order_id },
      });

      const total = updatedOrderItems.reduce(
        (acc, ele) =>
          ele['discount_type'] == 1
            ? acc + ele['price'] * ele['amount'] - ele['discount']
            : acc +
              (ele['price'] * ele['amount'] * (100 - ele['discount'])) / 100,
        0,
      );

      await this.orderRepo.update({ order_code }, { total });
    }
  }

  async getByPhoneAndId(phone: string, order_code: number) {
    const order = await this.orderRepo.findOne({
      order_code,
      s_phone: phone,
    });

    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng.', 404);
    }

    return this.getOrderDetails(order);
  }

  async getByCustomerId(customer_id: number, params) {
    const customer = await this.userRepo.findOne({ user_id: customer_id });
    if (!customer) {
      throw new HttpException('Không tìm thấy khách hàng.', 404);
    }

    let filterConditions = { user_id: customer_id };
    return this.getOrdersList(params, filterConditions, true);
  }

  async getList(params) {
    return this.getOrdersList(params);
  }

  async getOrdersList(params, filterConditions = {}, showDetails = false) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.orderRepo.tableProps.includes(key)) {
          filterConditions[`${Table.ORDERS}.${key}`] = Like(val);
          continue;
        }
      }
    }

    const ordersList = await this.orderRepo.find({
      select: [`DISTINCT(${Table.ORDERS}.order_id), ${Table.ORDERS}.*`],
      join: orderJoiner,
      orderBy: [{ field: `${Table.ORDERS}.updated_date`, sortBy: SortBy.DESC }],
      where: orderSearchFilter(search, { ...filterConditions }),
      skip,
      limit,
    });

    // lấy địa chỉ
    for (let orderItem of ordersList) {
      // Case for getting all order items
      if (showDetails) {
        orderItem = await this.getOrderDetails(orderItem);
        continue;
      }
      // Case for getting only order info, not order items
      if (orderItem.store_id) {
        const store = await this.storeLocationRepo.findOne({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.STORE_LOCATION_DESCRIPTIONS]: {
                fieldJoin: 'store_location_id',
                rootJoin: 'store_location_id',
              },
            },
          },
          where: {
            [`${Table.STORE_LOCATIONS}.store_location_id`]: orderItem.store_id,
          },
        });
        if (store) {
          orderItem['store'] = store;
        }

        // Lấy thông tin trạng thái đơn hàng
        const status = await this.statusRepo.findOne({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: statusJoiner,
          },
          where: {
            [`${Table.STATUS}.status_value`]: orderItem.status,
            [`${Table.STATUS}.type`]: StatusType.Order,
          },
        });

        if (status) {
          orderItem['status'] = status;
        }
      }

      // Lấy địa chỉ theo id
      if (orderItem['b_city'] && !isNaN(1 * orderItem['b_city'])) {
        const city = await this.cityRepo.findOne({ id: orderItem['b_city'] });
        if (city) {
          orderItem['b_city'] = city['city_name'];
        }
      }
      if (orderItem['b_district'] && !isNaN(1 * orderItem['b_district'])) {
        const district = await this.districtRepo.findOne({
          id: orderItem['b_district'],
        });
        if (district) {
          orderItem['b_district'] = district['district_name'];
        }
      }
      if (orderItem['b_ward'] && !isNaN(1 * orderItem['b_ward'])) {
        const ward = await this.wardRepo.findOne({ id: orderItem['b_ward'] });
        if (ward) {
          orderItem['b_ward'] = ward['ward_name'];
        }
      }
    }

    const count = await this.orderRepo.find({
      select: [`DISTINCT(COUNT(${Table.ORDERS}.order_id)) as total`],
      where: orderSearchFilter(search, filterConditions),
    });

    return {
      orders: ordersList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : 0,
      },
    };
  }

  async getByOrderCode(order_code: number) {
    const order = await this.orderRepo.findOne({ order_code });

    return this.getOrderDetails(order);
  }

  async getByRefOrderId(ref_order_id: string) {
    const order = await this.orderRepo.findOne({ ref_order_id });
    if (!order) {
      throw new HttpException('Đơn hàng không tồn tại', 404);
    }

    return this.getOrderDetails(order);
  }

  async getOrderDetails(order) {
    if (order.store_id) {
      const store = await this.storeLocationRepo.findOne({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.STORE_LOCATION_DESCRIPTIONS]: {
              fieldJoin: 'store_location_id',
              rootJoin: 'store_location_id',
            },
          },
        },
        where: {
          [`${Table.STORE_LOCATIONS}.store_location_id`]: order.store_id,
        },
      });
      if (store) {
        order['store'] = store;
      }
    }

    const status = await this.statusRepo.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: statusJoiner,
      },
      where: {
        [`${Table.STATUS}.status_value`]: order.status,
        [`${Table.STATUS}.type`]: StatusType.Order,
      },
    });

    if (status) {
      order['status'] = status;
    }

    const orderDetails = await this.orderDetailRepo.find({
      select: `${Table.PRODUCTS}.slug, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.ORDER_DETAILS}.*`,
      join: orderDetailsJoiner,
      where: {
        [`${Table.ORDER_DETAILS}.order_id`]: order.order_id,
        [`${Table.ORDER_DETAILS}.status`]: 'A',
      },
    });

    if (orderDetails.length) {
      for (let orderDetail of orderDetails) {
        orderDetail['image'] = null;
        const productImage = await this.imageLinkRepo.findOne({
          object_id: orderDetail.product_id,
          object_type: ImageObjectType.PRODUCT,
        });
        if (productImage) {
          let image = await this.imageRepo.findOne({
            image_id: productImage.image_id,
          });
          orderDetail['image'] = image;
        }
      }
    }

    if (order['s_city']) {
      let city = await this.locatorService.getCitiesList(order['s_city']);
      if (city.length) {
        order['cityName'] = city[0].city_name;
      }
    }

    if (order['s_district'] && order['s_city']) {
      let district = await this.locatorService.getDistrictsList(
        order['s_city'],
        order['s_district'],
      );
      if (district.length) {
        order['districtName'] = district[0].district_name;
      }
    }

    if (order['s_ward'] && order['s_district']) {
      let ward = await this.locatorService.getWardsList(
        order['s_district'],
        order['ward'],
      );
      if (ward.length) {
        order['wardName'] = ward[0].ward_name;
      }
    }

    order['order_items'] = orderDetails;
    return order;
  }

  async updateOrderStatus(order_code, order_status) {
    const order = await this.orderRepo.findOne({ order_code });
    if (!order) {
      throw new HttpException(
        `Không tìm thấy đơn hàng có mã ${order_code}`,
        404,
      );
    }
    await this.orderRepo.update({ order_code }, { status: order_status });
  }

  async getHistory(order_id: number) {
    return this.orderHistoryRepo.find({
      select: '*',
      where: { order_id },
    });
  }
}
