import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Put,
  UseGuards,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { CategoryService } from '../../services/category.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import {
  CategoryDescriptionDto,
  CreateCategoryDto,
  CreateCategoryVendorProductCountDto,
} from '../../dto/category/create-category.dto';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
import { UpdateCategoryDto } from '../../dto/category/update-category.dto';
import { ValidationPipe } from '@nestjs/common';
import {
  UpdateCategoryDescriptionDto,
  UpdateCategoryVendorProductCountDto,
} from '../../dto/category/update-category.dto';

/**
 * Controller for Category
 * @Author MvThang
 */
@Controller('/be/v1/category')
export class CategoryController extends BaseController {
  constructor(private categoryService: CategoryService) {
    super();
  }

  /**
   * Create new record in ddv_categories table
   * @param categoryDto
   * @param res
   * @returns
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() categoryDto: CreateCategoryDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const createdCategory = await this.categoryService.Create(categoryDto);
    return this.responseSuccess(res, createdCategory);
  }

  /**
   * create new record in ddv_category_descriptions table
   * @param categoryDescriptionDto
   * @param res
   * @returns
   */
  @Post('description/:category_id')
  @UseGuards(AuthGuard)
  async createDescription(
    @Body() data: CategoryDescriptionDto,
    @Param('category_id') category_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const createdCategoryDescription =
      await this.categoryService.CreateDescription(category_id, data);
    return this.responseSuccess(res, createdCategoryDescription);
  }

  /**
   * Fetch list categories in ddv_categories table
   * @param skip number
   * @param limit number
   * @param res categories[]
   * @returns
   */
  @Get()
  async fetchList(@Query() query, @Res() res: Response): Promise<IResponse> {
    const categoriesList = await this.categoryService.fetchList(query);

    return this.responseSuccess(res, categoriesList);
  }

  /**
   * Update records by category_id in ddv_categories table
   * @param categoryDto
   * @param id
   * @param res
   * @returns
   */
  @Put('/:id')
  @UseGuards(AuthGuard)
  async update(
    @Body() categoryDto: UpdateCategoryDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedCategory = await this.categoryService.Update(id, categoryDto);
    return this.responseSuccess(res, updatedCategory);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.categoryService.Delete(id);
    return boolRes
      ? this.respondNoContent(res)
      : this.respondNotFound(res, 'Xoá không thành công.');
  }

  // /**
  //  * get by company id in ddv_categories table
  //  * @param company_id
  //  * @param res
  //  * @returns
  //  */
  // @Get('/company/:company_id')
  // async getCategoryByCompanyId(
  //   @Param('company_id') company_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const category = await this.categoryService.findCategoryByCompanyId(
  //     company_id,
  //   );

  //   return this.responseSuccess(res, category);
  // }

  // /**
  //  * Delete category by category_id in ddv_categories table, then delete record in  ddv_category_vendor_product_count and ddv_category_descriptions table
  //  * @param id
  //  * @param res
  //  * @returns
  //  */
  // @Delete('/delete/:category_id')
  // async deleteCategory(
  //   @Param('category_id') category_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const boolRes = await this.categoryService.deleteCategory(category_id);
  //   return boolRes
  //     ? this.responseSuccessNoContent(res)
  //     : this.respondNotFound(res, `Không tìm thấy id ${category_id} để xoá.`);
  // }

  // /**
  //  * Get by category_id in ddv_category_descriptions table
  //  * @param category_id
  //  * @param res
  //  * @returns
  //  */
  // @Get('description/search/:category_id')
  // async getCategoryDescriptionByCategoryId(
  //   @Param('category_id') category_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const categoryDescription =
  //     await this.categoryService.findCategoryDescriptionByCategoryId(
  //       category_id,
  //     );

  //   return this.responseSuccess(res, categoryDescription);
  // }

  // /**
  //  * fetch list categories sorted by created_at
  //  * @param skip
  //  * @param limit
  //  * @param res
  //  * @returns
  //  */
  // @Get('description')
  // async fetchCategoryDescription(
  //   @Query('skip') skip: number,
  //   @Query('limit') limit: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const listCategoryDesc =
  //     await this.categoryService.fetchCategoryDescriptionList(skip, limit);
  //   return this.responseSuccess(res, listCategoryDesc);
  // }

  // /**
  //  * Update category description by category_id in ddv_category_descriptions
  //  * @param updateCategoryDescriptionDto
  //  * @param company_id
  //  * @param res
  //  * @returns
  //  */
  // @Put('description')
  // @UseGuards(AuthGuard)
  // async updateCategoryDescription(
  //   @Body() data: UpdateCategoryDescriptionDto,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const updatedCategoryDescription =
  //     await this.categoryService.updateCategoryDescription(data);
  //   return this.responseSuccess(res, updatedCategoryDescription);
  // }

  // /**
  //  * Delete category description in ddv_category_descriptions
  //  * @param id
  //  * @param res
  //  * @returns
  //  */
  // @Delete('description/delete/:category_id')
  // async deleteCategoryDescription(
  //   @Param('category_id') category_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const boolRes = await this.categoryService.deleteCategoryDescription(
  //     category_id,
  //   );
  //   return boolRes
  //     ? this.responseSuccessNoContent(res)
  //     : this.respondNotFound(res, `Không tìm thấy id ${category_id} để xoá.`);
  // }

  // /**
  //  * Create new record in ddv_category_vendor_product_count table
  //  * @param createCategoryVendorProductCountDto
  //  * @param res
  //  * @returns
  //  */
  // @Post('vendor-product-count')
  // @UseGuards(AuthGuard)
  // async createCategoryVendorProductCount(
  //   @Body()
  //   data: CreateCategoryVendorProductCountDto,
  //   @Res() res: Response,
  // ) {
  //   const createdCategoryVendor =
  //     await this.categoryService.createCategoryVendorProductCount(data);
  //   return this.respondCreated(res, createdCategoryVendor);
  // }

  // /**
  //  * Fetch list category vendor product count with skip and limit
  //  * @param skip
  //  * @param limit
  //  * @param res
  //  * @returns
  //  */
  // @Get('vendor-product-count')
  // async fetchListVendorProductCount(
  //   @Query('skip') skip: number = 0,
  //   @Query('limit') limit: number = 10,
  //   @Res() res,
  // ): Promise<IResponse> {
  //   const listVendor = await this.categoryService.fetchVendorProductCount(
  //     skip,
  //     limit,
  //   );
  //   return this.responseSuccess(res, listVendor);
  // }
  // /**
  //  * Get by category_id in ddv_category_vendor_product_count table
  //  * @param category_id
  //  * @param res
  //  * @returns
  //  */
  // @Get('vendor-product-count/search/:category_id')
  // async getCategoryVendorProductCountById(
  //   @Param('category_id') category_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const categoryVendor =
  //     await this.categoryService.findCategoryVendorProductCountByCategoryId(
  //       category_id,
  //     );

  //   return this.responseSuccess(res, categoryVendor);
  // }

  // /**
  //  * Get by company id in ddv_category_vendor_product_count table
  //  * @param id
  //  * @param res
  //  * @returns
  //  */
  // @Get('vendor-product-count/company/:company_id')
  // async getCategoryVendorProductCountByCompanyId(
  //   @Param('company_id') company_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const categoryVendor =
  //     await this.categoryService.findCategoryVendorProductCountByCompanyId(
  //       company_id,
  //     );

  //   return this.responseSuccess(res, categoryVendor);
  // }

  // @Put('vendor-product-count')
  // @UseGuards(AuthGuard)
  // async updateCategoryVendorProductCount(
  //   @Body()
  //   data: UpdateCategoryVendorProductCountDto,

  //   @Res() res: Response,
  // ) {
  //   const updatedCategoryVendor =
  //     await this.categoryService.updateCategoryVendorProductCount(data);
  //   return this.responseSuccess(res, updatedCategoryVendor);
  // }

  // /**
  //  * Delete record by category_id in ddv_category_vendor_product_count
  //  * @param id
  //  * @param res
  //  * @returns
  //  */
  // @Delete('vendor-product-count/delete')
  // async deleteCategoryVendorProductCount(
  //   @Query('category_id') category_id: number,
  //   @Query('company_id') company_id: number,
  //   @Res() res: Response,
  // ): Promise<IResponse> {
  //   const boolRes = await this.categoryService.deleteCategoryVendorProductCount(
  //     category_id,
  //     company_id,
  //   );
  //   return boolRes
  //     ? this.responseSuccessNoContent(res)
  //     : this.respondNotFound(
  //         res,
  //         `Không tìm thấy category_id ${category_id} và company_id ${company_id} để xoá.`,
  //       );
  // }
}
