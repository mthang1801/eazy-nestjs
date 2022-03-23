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
  orderJoiner,
  productJoiner,
  statusJoiner,
} from '../../utils/joinTable';
import { itgOrderFromAppcore } from 'src/utils/integrateFunctions';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
import e from 'express';
import { sortBy } from 'lodash';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { data } from '../../database/constant/category';
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
  ) {}

  async create(data: CreateOrderDto) {
    let user: any = await this.userRepo.findById(data.user_id);
    if (!user) {
      user = await this.userRepo.findOne({ phone: data.b_phone });
      // Nếu không có thông tin user thì sẽ tạo mới
      if (!user) {
        user = await this.createCustomer(data);
      }
    }

    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
      is_sync: 0,
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
        join: { [JoinTable.leftJoin]: productJoiner },
        where: { [`${Table.PRODUCTS}.product_id`]: orderItem.product_id },
      });

      if (!productInfo) {
        throw new HttpException(
          `Không tìm thấy sản phẩm có id ${orderItem.product_id}`,
          404,
        );
      }

      orderData['total'] +=
        ((productInfo['price'] * (100 - productInfo['percentage_discount'])) /
          100) *
        orderItem.amount;
    }

    let result = await this.orderRepo.create(orderData);
    for (let orderItem of data.order_items) {
      let orderDetailData = {
        ...new OrderDetailsEntity(),
        ...this.orderDetailRepo.setData({
          ...result,
          ...orderItem,
          status: CommonStatus.Active,
        }),
      };

      const orderProductItem = await this.productRepo.findOne({
        select: '*',
        join: productJoiner,
        where: { product_id: orderItem.product_id },
      });

      let newOrderDetail = await this.orderDetailRepo.create(orderDetailData);

      newOrderDetail['product_id'] = orderProductItem['product_appcore_id'];

      result['order_items'] = result['order_items']
        ? [...result['order_items'], newOrderDetail]
        : [newOrderDetail];
    }

    console.log(result);

    //============ Push data to Appcore ==================
    const configPushOrderToAppcore: any = {
      method: 'POST',
      url: PUSH_ORDER_TO_APPCORE_API,
      headers: {
        'Content-Type': 'application/json',
      },
      data: convertDataToIntegrate(result),
    };

    const configGetOrderFromAppcore = (orderId): any => ({
      method: 'GET',
      url: GET_ORDER_BY_ID_FROM_APPCORE_API(orderId),
    });

    try {
      const response = await axios(configPushOrderToAppcore);
      const orderAppcoreId = response.data.data;

      const getOrderDetailsResponse = await axios(
        configGetOrderFromAppcore(orderAppcoreId),
      );

      const orderInfoDetails = getOrderDetailsResponse.data.data.filter(
        ({ id }) => id === orderAppcoreId,
      )[0];

      if (orderInfoDetails) {
        const order_code = orderAppcoreId;
        const orderCodeItems = result['order_items'].map((orderItem) => {
          const orderAppcoreItem = orderInfoDetails['orderItems'].find(
            ({ productId }) => productId == orderItem.product_id,
          );
          if (orderAppcoreItem) {
            return {
              order_item_id: orderItem.item_id,
              order_item_appcore_id: orderAppcoreItem.id,
            };
          }
          return {
            order_item_id: orderItem.item_id,
            order_item_appcore_id: null,
          };
        });

        // update order code
        await this.orderRepo.update(
          { order_id: result.order_id },
          { order_code },
        );

        if (orderCodeItems?.length) {
          for (let { order_item_id, order_item_appcore_id } of orderCodeItems) {
            await this.orderDetailRepo.update(
              {
                item_id: order_item_id,
              },
              { order_item_appcore_id },
            );
          }
        }
      }
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

  async FEcreate(data: CreateOrderFEDto, userAuth) {
    let user = await this.userRepo.findOne({ user_id: userAuth.user_id });
    if (user['user_appcore_id']) {
      await this.customerService.createCustomerToAppcore(user);
      user = await this.userRepo.findOne({ user_id: userAuth.user_id });
    }
    const cart = await this.cartRepo.findOne({ user_id: user.user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    const cartItems = await this.cartItemRepo.find({ cart_id: cart.cart_id });
    if (!cartItems.length) {
      throw new HttpException('Không tìm thấy sản phẩm trong giỏ hàng', 404);
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

  async itgGet() {
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

  async itgCreate(data: CreateOrderAppcoreDto) {
    const order = await this.orderRepo.findOne({
      order_code: data.order_code,
    });
    if (order) {
      throw new HttpException(
        'Mã đơn hàng từ Appcore đã tồn tại trong hệ thống',
        409,
      );
    }

    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
    };

    orderData['total'] = 0;

    if (data?.order_items?.length) {
      for (let orderItem of data.order_items) {
        const orderDetail = await this.orderDetailRepo.findOne({
          order_item_appcore_id: orderItem.order_item_appcore_id,
        });
        if (orderDetail) {
          throw new HttpException('Mã chi tiết đơn hàng đã tồn tại', 409);
        }
        orderData['total'] += orderItem['price'] * orderItem['amount'];
      }
    }

    const user = await this.userRepo.findOne({
      user_appcore_id: data.user_appcore_id,
    });
    if (user) {
      orderData['user_id'] = user.user_id;
    }

    for (let orderItem of data.order_items) {
      orderData['total'] += orderItem.price * orderItem.amount;
    }

    let result = await this.orderRepo.create(orderData);

    if (data.order_items.length) {
      for (let orderItem of data.order_items) {
        let orderDetailData = {
          ...new OrderDetailsEntity(),
          ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
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
    const order = await this.orderRepo.findOne({ order_code });
    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }

    let result = { ...order };
    const orderData = await this.orderRepo.setData({ ...data });

    if (data.user_appcore_id) {
      const user = await this.userRepo.findOne({
        user_appcore_id: data.user_appcore_id,
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
    }

    const orderItemsList = await this.orderDetailRepo.find({
      select: '*',
      where: { order_id: order.order_id },
    });

    if (data?.order_items?.length) {
      let willRemoveOrderItems = [];
      let willAddNewOrderItems = [];
      let willUpdateOrderItems = [];
      for (let orderItem of data.order_items) {
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
          order_id: order.order_id,
        };
        await this.orderDetailRepo.create(orderItemData);
      }

      const updatedOrderItems = await this.orderDetailRepo.find({
        select: '*',
        where: { order_id: order.order_id },
      });
      console.log(updatedOrderItems);
      const total = updatedOrderItems.reduce(
        (acc, ele) => acc + ele.price * ele.amount,
        0,
      );

      await this.orderRepo.update({ order_code }, { total });
    }
  }

  async getByPhoneAndId(phone: string, order_id: number) {
    const order = await this.orderRepo.findOne({
      order_id,
      b_phone: phone,
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
            [`${Table.STATUS}.status`]: orderItem.status,
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
        [`${Table.STATUS}.status`]: order.status,
        [`${Table.STATUS}.type`]: StatusType.Order,
      },
    });

    if (status) {
      order['status'] = status;
    }

    const orderDetails = await this.orderDetailRepo.find({
      select: `${Table.PRODUCTS}.slug, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.ORDER_DETAILS}.*`,
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
        },
      },
      where: {
        [`${Table.ORDER_DETAILS}.order_id`]: order.order_id,
        [`${Table.ORDER_DETAILS}.status`]: 'A',
      },
    });

    if (orderDetails.length) {
      for (let orderDetail of orderDetails) {
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

    order['order_items'] = orderDetails;
    return order;
  }
}
