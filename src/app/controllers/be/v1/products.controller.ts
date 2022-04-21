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
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from '../../../../base/base.controllers';
import { IResponse } from '../../../interfaces/response.interface';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { DeleteProductImageDto } from '../../../dto/product/delete-productImage.dto';
import { UpdateProductDto } from '../../../dto/product/update-product.dto';
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

  @Get('/search')
  async searchList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.searchList(params);
    return this.responseSuccess(res, result);
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
    const result = await this.service.getListBE(params);
    return this.responseSuccess(res, result);
  }

  @Get('/reviews')
  async getReviewsList(
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getReviewsListCMS(params, 1);
    return this.responseSuccess(res, result);
  }

  @Get('/comments')
  async getCommentsList(
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getReviewsListCMS(params, 2);
    return this.responseSuccess(res, result);
  }

  @Get('/reviews-comments')
  async getCommentsReviewsList(
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getCommentsReviewsList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/response-reviews-comments/:item_id')
  async getCommentReviewResponse(
    @Param('item_id') item_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getCommentReviewResponse(item_id);
    return this.responseSuccess(res, result);
  }

  @Post('grouping-products/:start_product_id')
  async groupingProducts(
    @Res() res: Response,
    @Param('start_product_id') start_product_id: number,
    @Body('dest_product_id') dest_product_id: number,
  ): Promise<IResponse> {
    await this.service.groupingProducts(start_product_id, dest_product_id);
    return this.responseSuccess(res, null, 'Thành công.');
  }

  @Get('/parents')
  async getParentsList(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getParentsList(params);
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

  @Get('/:id/products-stores')
  async getProductsStores(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getProductsStores(id);
    return this.responseSuccess(res, result);
  }

  @Put('/reviews/:item_id')
  async updateReviews(
    @Param('item_id') item_id: string,
    @Body() data,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.updateReviewComment(item_id, data, 1);
    return this.responseSuccess(res);
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

  @Post(':product_id/upload-meta-image')
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
    @Param('product_id') product_id: string,
  ) {
    await this.service.uploadMetaImage(file, product_id);
    return this.responseSuccess(res, null, 'Cập nhật hình ảnh thành công.');
  }

  @Post(':product_id/upload-thumbnail')
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
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('product_id') product_id: string,
  ) {
    await this.service.uploadThumbnail(file, product_id);
    return this.responseSuccess(res, null, 'Cập nhật hình ảnh thành công.');
  }

  @Delete(':product_id/meta-image/')
  async deleteMetaImage(
    @Res() res: Response,
    @Param('product_id') product_id: string,
  ) {
    await this.service.deleteMetaImage(product_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Delete(':product_id/thumbnail/')
  async deleteThumbnail(
    @Res() res: Response,
    @Param('product_id') product_id: string,
  ) {
    await this.service.deleteThumbnail(product_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Put('/:identifier/delete-images')
  async deleteProductImage(
    @Param('identifier') identifier: string | number,
    @Res() res: Response,
    @Body() data: DeleteProductImageDto,
  ) {
    let message = await this.service.deleteProductImage(identifier, data);
    return this.responseSuccess(res, null, message);
  }

  @Delete('/clear')
  async delete(@Res() res: Response): Promise<IResponse> {
    await this.service.clearAll();
    return this.responseSuccess(res, null, 'Clear thành công');
  }
}
