import { Module } from '@nestjs/common';
import { ReviewsCommentsController } from '../controllers/be/v1/reviewsComments.controller';
import { RestrictedCommentRepository } from '../repositories/restrictedComment.repository';
import { ReviewsCommentService } from '../services/reviewsComments.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewCommentItemRepository } from '../repositories/reviewCommentItem.repository';
import { ProductsRepository } from '../repositories/products.repository';

@Module({
  controllers: [ReviewsCommentsController],
  providers: [
    ReviewsCommentService,
    RestrictedCommentRepository,
    ReviewRepository,
    ReviewCommentItemRepository,
    ProductsRepository,
  ],
  exports: [
    ReviewsCommentService,
    RestrictedCommentRepository,
    ReviewRepository,
    ReviewCommentItemRepository,
    ProductsRepository,
  ],
  imports: [],
})
export class ReviewsCommentsModule {}
