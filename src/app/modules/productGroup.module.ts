import { Module } from '@nestjs/common';
import { ProductGroupController } from '../controllers/be/productGroup.controller';
import { ProductGroupService } from '../services/productGroup.service';
import { ProductsModule } from './products.module';

@Module({
  imports: [ProductsModule],
  providers: [ProductGroupService],
  controllers: [ProductGroupController],
})
export class ProductGroupModule {}
