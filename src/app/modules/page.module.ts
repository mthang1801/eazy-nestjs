import { Module } from '@nestjs/common';
import { PageController } from '../controllers/be/v1/page.controller';
import { PageService } from '../services/page.service';
import { PageRepository } from '../repositories/page.repository';
import { PageDetailRepository } from '../repositories/pageDetail.repository';
import { PageDetailValueRepository } from '../repositories/pageDetailValue.repository';
import { PageControllerTester } from '../controllers/tester/page.controller';
import { ProductsRepository } from '../repositories/products.repository';

@Module({
  controllers: [PageController, PageControllerTester],
  providers: [
    PageService,
    PageRepository,
    PageDetailRepository,
    PageDetailValueRepository,
    ProductsRepository,
  ],
  exports: [
    PageService,
    PageRepository,
    PageDetailRepository,
    PageDetailValueRepository,
    ProductsRepository,
  ],
})
export class PageModule {}
