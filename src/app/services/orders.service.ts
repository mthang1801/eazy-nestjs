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
import { orderSearchFilter } from 'src/utils/tableConditioner';
import { Like } from 'src/database/find-options/operators';
import { StatusRepository } from '../repositories/status.repository';
import { StatusEntity } from '../entities/status.entity';
import { OrderStatusEnum, StatusType } from '../../database/enums/status.enum';
import { orderJoiner, statusJoiner } from '../../utils/joinTable';
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

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrdersRepository<OrderEntity>,
    private orderDetailRepo: OrderDetailsRepository<OrderDetailsEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userRepo: UserRepository<UserEntity>,
    private statusRepo: StatusRepository<StatusEntity>,
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
  ) {}

  async create(data: CreateOrderDto) {
    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
      status: OrderStatusEnum.Failed,
    };

    orderData['total'] = 0;
    for (let orderItem of data.order_items) {
      orderData['total'] += orderItem.price * orderItem.amount;
    }

    let result = await this.orderRepo.create(orderData);
    for (let orderItem of data.order_items) {
      let orderDetailData = {
        ...new OrderDetailsEntity(),
        ...this.orderDetailRepo.setData({
          ...result,
          ...orderItem,
          status: 'A',
        }),
      };

      const newOrderDetail = await this.orderDetailRepo.create(orderDetailData);

      result['order_items'] = result['order_items']
        ? [...result['order_items'], newOrderDetail]
        : [newOrderDetail];
    }

    //============ Push data to Appcore ==================
    const config: any = {
      method: 'POST',
      url: 'http://mb.viendidong.com/core-api/v1/orders/cms/create',
      headers: {
        'Content-Type': 'application/json',
      },
      data: convertDataToIntegrate(result),
    };

    try {
      const response = await axios(config);
      let message = 'Đã đẩy đơn hàng đến appcore thất bại';
      if (response?.data?.data) {
        const origin_order_id = response.data.data;
        let updateOriginOrderId = await this.orderRepo.update(
          { order_id: result.order_id },
          { origin_order_id, status: OrderStatusEnum.Open },
        );

        result = { ...result, ...updateOriginOrderId };

        message = 'Đẩy đơn hàng đến appcore thành công';
      }
      return { result, message };
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
              console.log(orderItem);
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
        url: 'http://mb.viendidong.com/core-api/v1/orders?page=10',
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
      console.log(error);
      throw new HttpException('Có lỗi xảy ra', 422);
    }
  }

  async itgCreate(data) {
    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
    };

    orderData['total'] = 0;
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

  async itgUpdate(origin_order_id: string, data) {
    const order = await this.orderRepo.findOne({ origin_order_id });
    if (!order) {
      throw new HttpException(
        `Không tìm thấy đơn hàng có id ${origin_order_id} được gửi từ AppCore`,
        404,
      );
    }

    let result = { ...order };

    const orderData = this.orderRepo.setData(data);

    if (Object.entries(orderData).length) {
      const updatedData = await this.orderRepo.update(
        { origin_order_id },
        orderData,
      );
      result = { ...result, ...updatedData };
    }

    result['order_items'] = [];

    if (data?.order_items?.length) {
      for (let orderItem of data.order_items) {
        const currentOrderItem = await this.orderDetailRepo.findOne({
          origin_order_item_id: orderItem.origin_order_item_id,
        });

        //Nếu có currentOrderItem thì update, ngược lại sẽ tạo mới
        if (currentOrderItem) {
          if (orderItem.deleted) {
            const updatedOrderItem = await this.orderDetailRepo.update(
              { origin_order_item_id: orderItem.origin_order_item_id },
              { status: 'D' },
            );
            result['order_items'] = [
              ...result['order_items'],
              updatedOrderItem,
            ];
          } else {
            const orderItemData = await this.orderDetailRepo.setData({
              ...orderItem,
            });
            if (Object.entries(orderItemData).length) {
              const updatedOrderItem = await this.orderDetailRepo.update(
                { origin_order_item_id: orderItem.origin_order_item_id },
                orderItemData,
              );
              result['order_items'] = [
                ...result['order_items'],
                updatedOrderItem,
              ];
            }
          }
        } else {
          const orderItemData = {
            ...new OrderDetailsEntity(),
            ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
          };
          const newOrderItem = await this.orderDetailRepo.create(orderItemData);
          result['order_items'] = [...result['order_items'], newOrderItem];
        }
      }
    }

    return result;
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
    return this.getOrdersList(params, filterConditions);
  }

  async getList(params) {
    return this.getOrdersList(params);
  }

  async getOrdersList(params, filterConditions = {}) {
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
      orderBy: [{ field: `${Table.ORDERS}.order_id`, sortBy: SortBy.DESC }],
      where: orderSearchFilter(search, { ...filterConditions }),
      skip,
      limit,
    });

    // lấy địa chỉ
    for (let orderItem of ordersList) {
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
      }
    }

    //Lấy thông tin trạng thái đơn hàng
    for (let orderItem of ordersList) {
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

  async getById(order_id: number) {
    const order = await this.orderRepo.findOne({ order_id });

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

  async callCreateItg() {}
}
