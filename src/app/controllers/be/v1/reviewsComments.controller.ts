import { Body, Controller, Provider, Res, Post, Get } from '@nestjs/common';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { ReviewsCommentService } from '../../../services/reviewsComments.service';
import { IResponse } from 'src/app/interfaces/response.interface';
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

  @Get('/restricted-keywords')
  async getRestrictedCommentsKeywords(
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.getRestrictedCommentsKeywords();
    return this.responseSuccess(res, result);
  }
}
