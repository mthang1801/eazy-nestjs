import {
  Body,
  Controller,
  Delete,
  Get,
  Optional,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
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
import { CreateCommentDto } from '../../../dto/reviewComment/create-comment.dto';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateCommentReviewCMSDto } from '../../../dto/reviewComment/create-commentReview.cms.dto';
import { ProductPreviewDto } from '../../../dto/product/create-productPreview.dto';
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
  @UseGuards(AuthGuard)
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getListBE(params);
    return this.responseSuccess(res, result);
  }

  @Get('/reviews-comments')
  @UseGuards(AuthGuard)
  async getCommentsReviewsList(
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getCommentsReviewsList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/response-reviews-comments/:item_id')
  @UseGuards(AuthGuard)
  async getCommentReviewResponse(
    @Param('item_id') item_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getCommentReviewResponse(item_id);
    return this.responseSuccess(res, result);
  }

  @Put('/standard')
  @UseGuards(AuthGuard)
  async standardizeProducts(@Res() res: Response): Promise<IResponse> {
    await this.service.standardizeProducts();
    return this.responseSuccess(res);
  }

  @Post('grouping-products/:start_product_id')
  @UseGuards(AuthGuard)
  async groupingProducts(
    @Res() res: Response,
    @Param('start_product_id') start_product_id: number,
    @Body('dest_product_id') dest_product_id: number,
  ): Promise<IResponse> {
    await this.service.groupingProducts(start_product_id, dest_product_id);
    return this.responseSuccess(res);
  }

  @Post('/product-preview')
  async createProductPreview(
    @Res() res: Response,
    @Body() data: ProductPreviewDto,
  ): Promise<IResponse> {
    const result = await this.service.createProductPreview(data);
    return this.responseSuccess(res, result, 'Thành công.');
  }

  @Get('product-preview/:product_id')
  async getProductPreview(
    @Res() res: Response,
    @Param('product_id') product_id: number,
  ): Promise<IResponse> {
    const result = await this.service.getProductPreview(product_id);
    return this.responseSuccess(res, result, 'Thành công.');
  }

  @Get('/parents')
  async getParentsList(
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getParentsList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':product_id')
  @UseGuards(AuthGuard)
  async get(
    @Param('product_id') product_id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.get(product_id);
    return this.responseSuccess(res, result);
  }

  @Get('/:product_id/products-stores')
  @UseGuards(AuthGuard)
  async getProductsStores(
    @Param('product_id') product_id: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getProductsStores(product_id);
    return this.responseSuccess(res, result);
  }

  @Put('/reviews-comments/:item_id')
  @UseGuards(AuthGuard)
  async updateReviewComment(
    @Param('item_id') item_id: string,
    @Body() data,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.updateReviewComment(item_id, data);
    return this.responseSuccess(res);
  }

  @Post('/:product_id/reviews-comments/')
  @UseGuards(AuthGuard)
  async createReviewComment(
    @Body() data: CreateCommentReviewCMSDto,
    @Res() res,
    @Req() req,
    @Param('product_id') product_id: number,
  ): Promise<IResponse> {
    await this.service.createReviewCommentCMS(data, product_id, req.user);
    return this.responseSuccess(res);
  }

  @Put(':identifier')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
    return this.responseSuccess(res, result);
  }

  @Post(':product_id/upload-meta-image')
  @UseGuards(AuthGuard)
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
    return this.responseSuccess(res);
  }

  @Post(':product_id/upload-thumbnail')
  @UseGuards(AuthGuard)
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
    return this.responseSuccess(res);
  }

  @Delete(':product_id/meta-image')
  @UseGuards(AuthGuard)
  async deleteMetaImage(
    @Res() res: Response,
    @Param('product_id') product_id: string,
  ) {
    await this.service.deleteMetaImage(product_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Delete(':product_id/thumbnail')
  @UseGuards(AuthGuard)
  async deleteThumbnail(
    @Res() res: Response,
    @Param('product_id') product_id: string,
  ) {
    await this.service.deleteThumbnail(product_id);
    return this.responseSuccess(res, null, 'Xoá thành công.');
  }

  @Put(':product_id/delete-images')
  @UseGuards(AuthGuard)
  async deleteProductImage(
    @Param('product_id') product_id: number,
    @Res() res: Response,
    @Body() data: DeleteProductImageDto,
  ) {
    let message = await this.service.deleteProductImage(product_id, data);
    return this.responseSuccess(res, null, message);
  }
}
