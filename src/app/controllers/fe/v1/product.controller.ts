import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ProductService } from 'src/app/services/products.service';
import { BaseController } from '../../../../base/base.controllers';
import { CreateProductDto } from '../../../dto/product/create-product.dto';
import { IResponse } from '../../../interfaces/response.interface';
import { Response, Request } from 'express';
import { CreateReviewDto } from '../../../dto/reviewComment/create-review.dto';
import { CreateCommentDto } from '../../../dto/reviewComment/create-comment.dto';
@Controller('fe/v1/products')
export class ProductsController extends BaseController {
  constructor(private service: ProductService) {
    super();
  }

  @Get('/search')
  async searchList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.searchList(params);
    return this.responseSuccess(res, result);
  }

  @Get(':slug')
  async get(
    @Param('slug') slug: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getBySlug(slug);
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

  @Get()
  async getList(@Query() params, @Res() res: Response): Promise<IResponse> {
    const result = await this.service.getListFE(params);
    return this.responseSuccess(res, result);
  }

  @Post('/:product_id/reviews')
  async createReviews(
    @Param('product_id') product_id: number,
    @Res() res: Response,
    @Body() data: CreateReviewDto,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.createReviewComment(data, product_id, 1, req.clientIp);
    return this.responseSuccess(res);
  }

  @Post('/:product_id/comments')
  async createComments(
    @Param('product_id') product_id: number,
    @Res() res: Response,
    @Body() data: CreateCommentDto,
    @Req() req,
  ): Promise<IResponse> {
    await this.service.createReviewComment(data, product_id, 2, req.clientIp);
    return this.responseSuccess(res);
  }

  @Get('/:product_id/reviews')
  async getReviewsList(
    @Param('product_id') product_id: number,
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getReviewsCommentsListWebsite(
      product_id,
      params,
      1,
    );
    return this.responseSuccess(res, result);
  }

  @Get('/:product_id/comments')
  async getComments(
    @Param('product_id') product_id: number,
    @Res() res: Response,
    @Query() params,
  ): Promise<IResponse> {
    const result = await this.service.getReviewsCommentsListWebsite(
      product_id,
      params,
      2,
    );
    return this.responseSuccess(res, result);
  }
}
