import { Module, Global, forwardRef } from '@nestjs/common';
import { UsersModule } from './users.module';
import { CustomerController as CustomerControllerBE } from '../controllers/be/v1/customer.controller';
import { CustomerService } from '../services/customer.service';
import { CustomerController as CustomerControllerIntergration } from '../controllers/integration/v1/customer.controller';
import { MailModule } from './mail.module';
import { OrdersModule } from './orders.module';
import { CustomerControllers } from '../controllers/sync/v1/customers.controller';

@Module({
  controllers: [
    CustomerControllerBE,
    CustomerControllerIntergration,
    CustomerControllers,
  ],
  providers: [CustomerService],
  exports: [CustomerService],
  imports: [MailModule, OrdersModule, UsersModule],
})
export class CustomerModule {}
