import { Injectable, HttpException } from '@nestjs/common';

import { OrderEntity } from '../entities/orders.entity';
import { OrdersRepository } from '../repositories/orders.repository';

import { formatDateTime } from '../../utils/helper';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { DatabaseService } from '../../database/database.service';
import { getProductsBestSeller } from '../../database/sqlQuery/others/reports/dashboard';
import { cacheKeys } from '../../utils/cache.utils';
import { RedisCacheService } from './redisCache.service';
import {
  getNumberCustomersMonthlyByYear,
  getProductsAmountInStores,
} from '../../database/sqlQuery/others/reports/dashboard';
import {
  getNumberOfOrdersInDaySQL,
  getNumberOrderMonthlyByYear,
} from '../../database/sqlQuery/others/reports/dashboard';
import {
  getOrderRevenueInDaySQL,
  getCustomerInDaySQL,
} from '../../database/sqlQuery/others/reports/dashboard';

@Injectable()
export class DashboardService {
  constructor(
    private orderRepo: OrdersRepository<OrderEntity>,
    private userRepo: UserRepository<UserEntity>,
    private db: DatabaseService,
  ) {}

  async getReportOverview() {
    let orderRevenueInDay = await this.getRevenueInDay();
    let numberOfCustomersInDay = await this.getCustomersInDay();
    let numberOrdersInDay = await this.getNumberOfOrdersInDay();

    return {
      revenueInDay: orderRevenueInDay,
      numberOfCustomersInDay,
      numberOrdersInDay: numberOrdersInDay,
    };
  }

  async getRevenueInDay() {
    let orderRevenueInDay;

    let orderRevenuesResponse = await this.orderRepo.readExec(
      getOrderRevenueInDaySQL,
    );
    let orderRevenues = orderRevenuesResponse[0];
    if (orderRevenues && orderRevenues.length) {
      orderRevenueInDay = orderRevenues.find(
        (orderRevenues) =>
          new Date(orderRevenues.date).toLocaleDateString() ==
          new Date().toLocaleDateString(),
      );

      if (orderRevenueInDay) {
        orderRevenueInDay['date'] = formatDateTime(orderRevenueInDay['date']);
      }
    }

    if (!orderRevenueInDay) {
      orderRevenueInDay = {
        date: formatDateTime(),
        totalRevenue: 0,
      };
    }

    return orderRevenueInDay;
  }

  async getCustomersInDay() {
    let numberOfCustomerInDay;

    let numberOfCustomersInDaysResponse = await this.userRepo.readExec(
      getCustomerInDaySQL,
    );
    let numberOfCustomersInDays = numberOfCustomersInDaysResponse[0];
    if (numberOfCustomersInDays && numberOfCustomersInDays.length) {
      numberOfCustomerInDay = numberOfCustomersInDays.find(
        (customer) =>
          new Date(customer.date).toLocaleDateString() ==
          new Date().toLocaleDateString(),
      );

      if (numberOfCustomerInDay) {
        numberOfCustomerInDay['date'] = formatDateTime(
          numberOfCustomerInDay['date'],
        );
      }
    }

    if (!numberOfCustomerInDay) {
      numberOfCustomerInDay = {
        date: formatDateTime(),
        numberOfUsers: 0,
      };
    }

    return numberOfCustomerInDay;
  }

  async getNumberOfOrdersInDay() {
    let numberOfOrderInDay;
    let numberOfOrdersResponse = await this.orderRepo.readExec(
      getNumberOfOrdersInDaySQL,
    );
    let numberOrders = numberOfOrdersResponse[0];
    if (numberOrders && numberOrders.length) {
      numberOfOrderInDay = numberOrders.find(
        (numberOrders) =>
          new Date(numberOrders.date).toLocaleDateString() ==
          new Date().toLocaleDateString(),
      );

      if (numberOfOrderInDay) {
        numberOfOrderInDay['date'] = formatDateTime(numberOfOrderInDay['date']);
      }
    }

    if (!numberOfOrderInDay) {
      numberOfOrderInDay = {
        date: formatDateTime(),
        totalUsers: 0,
      };
    }

    return numberOfOrderInDay;
  }

  async getOrdersCustomers(year) {
    const orders = await this.getNumberOrdersMonthly(year);
    const customers = await this.getNumberCustomersMonthly(year);

    return { orders, customers };
  }

  async getNumberOrdersMonthly(year) {
    let ordersMonthlyByYear = await this.db.executeQueryReadPool(
      getNumberOrderMonthlyByYear(year),
    );
    let results = Array.from({ length: 12 }).map((_) => 0);
    if (ordersMonthlyByYear[0] && ordersMonthlyByYear[0].length) {
      for (let numOrderMonthly of ordersMonthlyByYear[0]) {
        results[numOrderMonthly['month'] - 1] = numOrderMonthly['total'];
      }
    }

    return results;
  }

  async getNumberCustomersMonthly(year) {
    let customersMonthlyByYear = await this.db.executeQueryReadPool(
      getNumberCustomersMonthlyByYear(year),
    );

    let results = Array.from({ length: 12 }).map((_) => 0);
    if (customersMonthlyByYear[0] && customersMonthlyByYear[0].length) {
      for (let numCustomersMonthly of customersMonthlyByYear[0]) {
        results[numCustomersMonthly['month'] - 1] =
          numCustomersMonthly['total'];
      }
    }

    return results;
  }

  async getProductsAmountInStores(sortBy) {
    let productAmountStore = await this.db.executeQueryReadPool(
      getProductsAmountInStores(sortBy),
    );
    let results = [];
    if (productAmountStore[0]) {
      results = productAmountStore[0];
    }
    return results;
  }
  async getProductsBestSeller(params) {
    let { start_at, end_at, sortBy, type } = params;

    if (!start_at || !end_at) {
      throw new HttpException('Cần truyền vào ngày bắt đầu, kết thúc', 400);
    }
    let productsBestSeller = await this.db.executeQueryReadPool(
      getProductsBestSeller(start_at, end_at, type, sortBy),
    );

    let results = [];
    if (productsBestSeller[0]) {
      results = productsBestSeller[0];
    }
    return results;
  }
}
