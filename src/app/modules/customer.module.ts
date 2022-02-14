import { Module, Global } from '@nestjs/common';
import { UsersModule } from './users.module';
import { CustomerController } from '../controllers/be/customer.controller';
import { CustomerService } from '../services/customer.service';

@Module({
    controllers: [CustomerController],
    providers: [
        CustomerService
    ],
    exports: [
        CustomerService
    ],
    imports:[UsersModule],

})
export class CustomerModule { }
