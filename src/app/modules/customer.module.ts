import { Module, Global } from '@nestjs/common';
import { UsersModule } from './users.module';
import { CustomerController as CustomerControllerBE } from '../controllers/be/customer.controller';
import { CustomerService } from '../services/customer.service';
import { CustomerController as CustomerControllerIntergration } from '../controllers/integration/customer.controller';
import { MailModule } from './mail.module';

@Module({
  controllers: [CustomerControllerBE, CustomerControllerIntergration],
  providers: [CustomerService],
  exports: [CustomerService],
  imports: [UsersModule, MailModule],
})
export class CustomerModule {}
