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
import { BaseController } from '../../../base/base.controllers';
import { CategoryService } from '../../services/category.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import { CreateCategoryDto } from '../../dto/category/create-category.dto';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
import { UpdateCategoryDto } from '../../dto/category/update-category.dto';
import { ProductService } from 'src/app/services/products.service';
import { CreateCategoryV2Dto } from 'src/app/dto/category/create-category.v2.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

/**
 * Controller for Category
 * @Author MvThang
 */
//@UseGuards(AuthGuard)
@Controller('/be/v1/category')
export class CategoryController extends BaseController {
  constructor(
    private service: CategoryService,
    private productService: ProductService,
  ) {
    super();
  }

  @Get('/fill-idpath')
  async fillIdPath(@Res() res) {
    await this.service.fillCategoriesIdPath();
    return this.responseSuccess(res, null, 'Hoan tat.');
  }

  /**
   * Create new record in ddv_categories table
   * @param categoryDto
   * @param res
   * @returns
   */
  @Post()
  async create(
    @Body() categoryDto: CreateCategoryDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.create(categoryDto);
    return this.responseSuccess(res, result);
  }

  @Get('catalog')
  async getCatalog(@Res() res: Response, @Query() params) {
    const result = await this.service.getCatalog(params);
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
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const categoriesMenuList = await this.service.getList(params);
    return this.responseSuccess(res, categoriesMenuList);
  }

  @Get('/all')
  async getAll(
    @Res() res: Response,
    @Query('level') level: number,
  ): Promise<IResponse> {
    const result = await this.service.getAll(level);
    return this.responseSuccess(res, result);
  }

  /**
   * Get category item by category_id, if it is level 1, find all its children
   * @param id
   * @param res
   * @returns
   */
  @Get(':id')
  async get(@Param('id') id: number, @Res() res: Response): Promise<IResponse> {
    const categoryRes = await this.service.get(id);
    return this.responseSuccess(res, categoryRes);
  }

  /**
   * Update records by category_id in ddv_categories table
   * @param categoryDto
   * @param id
   * @param res
   * @returns
   */
  @Put('/:id')
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
    return this.responseSuccess(res, null, 'Cập nhật hình ảnh thành công.');
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
    return this.responseSuccess(res, null, 'Cập nhật hình ảnh thành công.');
  }

  @Delete(':category_id/meta-image/')
  async deleteMetaImage(
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.deleteMetaImage(category_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Delete(':category_id/icon/')
  async deleteIcon(
    @Res() res: Response,
    @Param('category_id') category_id: string,
  ) {
    await this.service.deleteIcon(category_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Delete('/:id')
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.service.delete(id);
    return boolRes
      ? this.responseSuccess(res, null, 'Xoá thành công')
      : this.responseNotFound(
          res,
          `Xoá không thành công, không tìm thấy id ${id}.`,
        );
  }

  @Get(':id/products')
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
}
