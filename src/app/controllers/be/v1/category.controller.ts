import { UpdateCatalogCategoryItemDto } from './../../../dto/category/update-catalogCategoryItem.dto';
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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { CategoryService } from '../../../services/category.service';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateCategoryDto } from '../../../dto/category/create-category.dto';
import { IResponse } from '../../../interfaces/response.interface';
import { Response } from 'express';
import { UpdateCategoryDto } from '../../../dto/category/update-category.dto';
import { ProductService } from 'src/app/services/products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { UpdateProductsInCategory } from 'src/app/dto/product/update-productInCategory';
import { CreateCatalogCategoryItemDto } from '../../../dto/category/create-catalogCategoryItem.dto';
import { UpDateCategoriesListDto } from '../../../dto/category/update-categoriesList.dto';

/**
 * Controller for Category
 * @Author MvThang
 */

@Controller('/be/v1/category')
export class CategoryController extends BaseController {
  constructor(
    private service: CategoryService,
    private productService: ProductService,
  ) {
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
    const result = await this.service.create(categoryDto);
    return this.responseSuccess(res, result);
  }

  /**
   * Danh muc ngành hàng
   * @param res
   * @param params
   * @returns
   */
  @Get('catalog')
  async getCatalog(@Res() res: Response, @Query() params) {
    const result = await this.service.getCatalog(params);
    return this.responseSuccess(res, result);
  }

  @Post('/catalog/item')
  async createCatalogCategoryItem(
    @Res() res: Response,
    @Body() data: CreateCatalogCategoryItemDto,
  ) {
    await this.service.createCatalogCategoryItem(data);
    return this.responseSuccess(res);
  }

  @Put('/catalog/item/:id')
  @UseGuards(AuthGuard)
  async updateCatalogCategoryItem(
    @Param('id') id: number,
    @Res() res: Response,
    @Body() data: UpdateCatalogCategoryItemDto,
  ): Promise<IResponse> {
    await this.service.updateCatalogCategoryItem(id, data);
    return this.responseSuccess(res);
  }

  @Get('catalog/item')
  async getAllCatalogCategoryItem(@Res() res: Response) {
    const result = await this.service.getAllCatalogCategoryItem();
    return this.responseSuccess(res, result);
  }

  @Get('catalog/item/:id')
  async getCatalogCategoryItemById(
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    const result = await this.service.getCatalogCategoryItemById(id);
    return this.responseSuccess(res, result);
  }

  @Get('accessories')
  async getAccessories(@Res() res: Response, @Query() params) {
    const result = await this.service.getAccessories(params);
    return this.responseSuccess(res, result);
  }

  /**
   * Fetch list categories in ddv_categories table
   * @param skip number
   * @param limit number
   * @param res categories[]
   * @returns
   */
  @Get()
  @UseGuards(AuthGuard)
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const categoriesMenuList = await this.service.getList(params);
    return this.responseSuccess(res, categoriesMenuList);
  }

  /**
   * Lấy tất cả danh mục trong db
   * @param res
   * @param level
   * @returns
   */
  @Get('/all')
  async getAll(
    @Res() res: Response,
    @Query('level') level: number,
  ): Promise<IResponse> {
    const result = await this.service.getAll(level);
    return this.responseSuccess(res, result);
  }

  /**
   *  Get category item by category_id, if it is level 1, find all its children
   * @param id
   * @param res
   * @param params
   * @returns
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async get(
    @Param('id') id: number,
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const categoryRes = await this.service.get(id, params);
    return this.responseSuccess(res, categoryRes);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateList(
    @Body() data: UpDateCategoriesListDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.updateList(data);
    return this.responseSuccess(res);
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
    const updatedCategory = await this.service.update(id, categoryDto);
    return this.responseSuccess(res, updatedCategory);
  }

  @Post(':category_id/upload-meta-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
            file.originalname
          }`;
          return cb(null, filename);
        },
      }),
    }),
  )
  async uploadMetaImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.uploadMetaImage(file, category_id);
    return this.responseSuccess(res);
  }

  @Post(':category_id/upload-icon')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, './uploads'),
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
            file.originalname
          }`;
          return cb(null, filename);
        },
      }),
    }),
  )
  async uploadIcon(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.uploadIcon(file, category_id);
    return this.responseSuccess(res);
  }

  @Delete(':category_id/meta-image/')
  async deleteMetaImage(
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.deleteMetaImage(category_id);
    return this.responseSuccess(res);
  }

  @Delete(':category_id/icon/')
  @UseGuards(AuthGuard)
  async deleteIcon(
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.deleteIcon(category_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Get(':id/products')
  @UseGuards(AuthGuard)
  async getProductsList(
    @Param('id') categoryId: number,
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.productService.getProductsListByCategoryId(
      categoryId,
      params,
    );
    return this.responseSuccess(res, result);
  }

  @Put(':id/products')
  @UseGuards(AuthGuard)
  async updateProductIntoCategory(
    @Param('id') categoryId: number,
    @Body() data: UpdateProductsInCategory,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.productService.updateProductIntoCategory(categoryId, data);
    return this.responseSuccess(res);
  }
}
