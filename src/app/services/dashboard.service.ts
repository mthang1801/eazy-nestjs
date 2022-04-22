import { Injectable } from '@nestjs/common';

import { OrderEntity } from '../entities/orders.entity';
import { OrdersRepository } from '../repositories/orders.repository';

import { formatDateTime } from '../../utils/helper';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { DatabaseService } from '../../database/database.service';
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
      numberOrdersInDay,
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
    return numberOfOrderInDay;
  }

  async getNumberOrdersMonthly(year) {
    let ordersMonthlyByYear = await this.db.executeQueryReadPool(
      getNumberOrderMonthlyByYear(year),
    );
    if (ordersMonthlyByYear[0]) {
      return ordersMonthlyByYear[0];
    }
    return [];
  }
}
