import { Module } from '@nestjs/common';
import { ReviewsCommentsController } from '../controllers/be/v1/reviewsComments.controller';
import { RestrictedCommentRepository } from '../repositories/restrictedComment.repository';
import { ReviewsCommentService } from '../services/reviewsComments.service';

@Module({
  controllers: [ReviewsCommentsController],
  providers: [ReviewsCommentService, RestrictedCommentRepository],
  exports: [ReviewsCommentService, RestrictedCommentRepository],
  imports: [],
})
export class ReviewsCommentsModule {}
