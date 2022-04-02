import { Module } from '@nestjs/common';
import { IndexController } from '../controllers/sync/index.controller';
import { IndexService } from '../services/index.service';
import { CategoryModule } from './category.module';
import { CustomerModule } from './customer.module';
import { ProductFeaturesModule } from './productFeatures.module';
import { ProductsModule } from './products.module';
@Module({
  controllers: [IndexController],
  providers: [IndexService],
  imports: [
    ProductFeaturesModule,
    CategoryModule,
    CustomerModule,
    ProductsModule,
  ],
})
export class IndexModule {}
