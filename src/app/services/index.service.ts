import { Injectable } from '@nestjs/common';
import { ProductFeatureService } from './productFeature.service';
import { CategoryService } from './category.service';
import { CustomerService } from './customer.service';
import { ProductService } from './products.service';
import { StoreService } from './store.service';

@Injectable()
export class IndexService {
  constructor(
    private productFeatureService: ProductFeatureService,
    private categoryService: CategoryService,
    private customerService: CustomerService,
    private productService: ProductService,
    private storeService: StoreService,
  ) {}
  async imports() {
    // //Import Product Features
    // await this.productFeatureService.syncImports();
    // //Import Category
    // await this.categoryService.syncImports();
    // //Import Catalog Categoris
    // await this.categoryService.syncImportCatalogs();
    // // Import Stores
    // await this.storeService.importStores();
    // // Import Customers
    // await this.customerService.importCustomers();
    // // Import Products
    // await this.productService.importProducts();
    // await this.productService.requestIntegrateParentProduct();
    // // Report Product Amount In Stocks
    // await this.productService.reportTotalProductsInStores();
    // // Report count total amount from all stores
    // await this.productService.reportCountTotalFromStores();
    // // Report Product In Category
    // await this.productService.reportCountTotalFromCategories();
    // Determin product functions
    // await this.productService.determineProductFunction();

    await this.productService.updateProductPrices();
  }
}
