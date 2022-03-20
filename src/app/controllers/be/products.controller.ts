import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { DeleteProductImageDto } from '../../dto/product/delete-productImage.dto';
import { UpdateProductDto } from '../../dto/product/update-product.dto';
@Controller('be/v1/products')
export class ProductsController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  /**
   * Sync products, join products into group, groups products and groups features
   * @param res
   * @returns
   */
  @Post('/sync')
  async syncProductsIntoGroup(@Res() res: Response): Promise<IResponse> {
    await this.service.syncProductsIntoGroup();
    return this.responseSuccess(res, null, 'Đồng bộ sản phẩm nhóm thành công.');
  }

  /**
   * Get products list
   * params includes page, limit, features are fields in database
   * @param params
   * @param res
   * @returns
   */
  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/parents')
  async getParentsList(@Res() res: Response): Promise<IResponse> {
    const result = await this.service.getParentsList();
    return this.responseSuccess(res, result);
  }

  @Get(':identifier')
  async get(
    @Param('identifier') identifier: number | string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.get(identifier);
    return this.responseSuccess(res, result);
  }

  @Get('/:id/product-stores')
  async getProductsStores(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getProductsStores(id);
    return this.responseSuccess(res, result);
  }

  @Put(':identifier')
  async update(
    @Param('identifier') identifier: string | number,
    @Body() data: UpdateProductDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.update(identifier, data);
    return this.responseSuccess(res, result);
  }

  /**
   * Upload product image
   * @param files
   * @param res
   * @param sku
   * @returns
   */
  @Post('upload-images/:sku')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
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
  async uploadImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
    @Param('sku') sku: string,
  ) {
    const result = await this.service.uploadImages(files, sku);
    return this.responseSuccess(res, result, 'Cập nhật hình ảnh thành công.');
  }

  @Put('/:sku/delete-images')
  async deleteProductImage(
    @Param('sku') sku: string,
    @Res() res: Response,
    @Body() data: DeleteProductImageDto,
  ) {
    let message = await this.service.deleteProductImage(sku, data);
    return this.responseSuccess(res, null, message);
  }

  @Delete('/clear')
  async delete(@Res() res: Response): Promise<IResponse> {
    await this.service.clearAll();
    return this.responseSuccess(res, null, 'Clear thành công');
  }
}
