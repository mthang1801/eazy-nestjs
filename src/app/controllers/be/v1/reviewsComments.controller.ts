import {
  Body,
  Controller,
  Provider,
  Res,
  Post,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { ReviewsCommentService } from '../../../services/reviewsComments.service';
import { IResponse } from 'src/app/interfaces/response.interface';
import { Param } from '@nestjs/common';
import { AuthGuard } from '../../../../middlewares/be.auth';
import { CreateCommentCMSDto } from '../../../dto/reviewComment/create-comment.cms.dto';
@Controller('/be/v1/reviews-comments')
export class ReviewsCommentsController extends BaseController {
  constructor(private service: ReviewsCommentService) {
    super();
  }

  @Post('/restricted-keywords')
  async createRestrictedCommentsKeywords(
    @Res() res: Response,
    @Body() data,
  ): Promise<IResponse> {
    await this.service.createRestrictedCommentsKeywords(data);
    return this.responseSuccess(res);
  }

  @Post('/response/:product_id')
  @UseGuards(AuthGuard)
  async createComment(
    @Param('product_id') product_id: number,
    @Body() data: CreateCommentCMSDto,
    @Req() req,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.createCommentCMS(
      data,
      product_id,
      req.user,
    );
    return this.responseSuccess(res, result);
  }

  @Get('/restricted-keywords')
  async getRestrictedCommentsKeywords(
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getRestrictedCommentsKeywords();
    return this.responseSuccess(res, result);
  }

  @Get()
  async getList(@Res() res: Response, @Query() params): Promise<IResponse> {
    const result = await this.service.getList(params);
    return this.responseSuccess(res, result);
  }

  @Get('/:item_id/response')
  async getCommentReviewResponse(
    @Param('item_id') item_id: number,
    @Query() params,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getCommentReviewResponse(item_id, params);
    return this.responseSuccess(res, result);
  }
}
