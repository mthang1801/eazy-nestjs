import { Module } from '@nestjs/common';
import { ReviewsCommentsController } from '../controllers/be/v1/reviewsComments.controller';
import { ReviewsCommentService } from '../services/reviewsComments.service';

@Module({
  controllers: [ReviewsCommentsController],
  providers: [ReviewsCommentService],
  exports: [ReviewsCommentService],
  imports: [],
})
export class ReviewsCommentsModule {}
