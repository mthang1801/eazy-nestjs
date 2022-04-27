import { Injectable } from '@nestjs/common';
import { RestrictedCommentEntity } from '../entities/restrictedComment.entity';
import { RestrictedCommentRepository } from '../repositories/restrictedComment.repository';

@Injectable()
export class ReviewsCommentService {
  constructor(
    private restrictedCommentRepo: RestrictedCommentRepository<RestrictedCommentEntity>,
  ) {}
  async createRestrictedCommentsKeywords(data) {
    const currentResitrictedComments = await this.restrictedCommentRepo.find();
    if (currentResitrictedComments.length) {
      for (let comment of currentResitrictedComments) {
        await this.restrictedCommentRepo.delete({ id: comment.id });
      }
    }
    const restrictedData = {
      ...new RestrictedCommentEntity(),
      ...this.restrictedCommentRepo.setData(data),
      keywords: JSON.stringify(data.keywords),
    };
    await this.restrictedCommentRepo.create(restrictedData);
  }

  async getRestrictedCommentsKeywords() {
    const result = await this.restrictedCommentRepo.findOne({});
    result['keywords'] = JSON.parse(result['keywords']);
    return result;
  }
}
