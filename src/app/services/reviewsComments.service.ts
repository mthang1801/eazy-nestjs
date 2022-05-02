import { Injectable, HttpException } from '@nestjs/common';
import { RestrictedCommentEntity } from '../entities/restrictedComment.entity';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewCommentItemsEntity } from '../entities/reviewCommentItems.entity';
import { RestrictedCommentRepository } from '../repositories/restrictedComment.repository';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewCommentItemRepository } from '../repositories/reviewCommentItem.repository';
import { reviewCommentProductJoiner } from '../../database/sqlQuery/join/product.join';
import { reviewCommentItemsSearchFilter } from '../../utils/tableConditioner';
import { IsNull, In, Between } from '../../database/operators/operators';
import { Table } from 'src/database/enums';
import {
  getPageSkipLimit,
  formatStandardTimeStamp,
  checkRestrictedCommentsListIntoRegularExpress,
} from '../../utils/helper';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CreateCommentReviewCMSDto } from '../dto/reviewComment/create-commentReview.cms.dto';
import { CreateCommentCMSDto } from '../dto/reviewComment/create-comment.cms.dto';

@Injectable()
export class ReviewsCommentService {
  constructor(
    private restrictedCommentRepo: RestrictedCommentRepository<RestrictedCommentEntity>,
    private reviewRepo: ReviewRepository<ReviewEntity>,
    private reviewCommentItemRepo: ReviewCommentItemRepository<ReviewCommentItemsEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
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
      keywords: data.keywords,
    };
    await this.restrictedCommentRepo.create(restrictedData);
  }

  async getRestrictedCommentsKeywords() {
    const result = await this.restrictedCommentRepo.findOne({});

    return result;
  }

  async getList(params) {
    let { search, product_id, point, suitable_level, is_replied } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    let filterConditions = {};
    if (product_id) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.product_id`] = product_id;
    }

    if (point) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.point`] = point;
    }

    if (suitable_level) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.suitable_level`] =
        suitable_level;
    }

    if (is_replied) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.is_replied`] = is_replied;
    }

    if (!search) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.parent_item_id`] =
        IsNull();
    }

    const reviewCommentItems = await this.reviewCommentItemRepo.find({
      select: `*, ${Table.REVIEW_COMMENT_ITEMS}.status, ${Table.PRODUCTS}.slug as productSlug`,
      join: reviewCommentProductJoiner,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let reviewCommentResults = [];
    for (let reviewCommentItem of reviewCommentItems) {
      if (
        reviewCommentItem['parent_item_id'] &&
        reviewCommentItem['parent_item_id'] != 0
      ) {
        if (
          reviewCommentResults.length &&
          reviewCommentResults.some(
            ({ item_id }) => item_id == reviewCommentItem['parent_item_id'],
          )
        ) {
          reviewCommentResults = reviewCommentResults.map((item) => {
            if (item.item_id == reviewCommentItem['parent_item_id']) {
              item['children'] = item['children']
                ? [...item['children'], reviewCommentItem]
                : [reviewCommentItem];
            }
            return item;
          });
        } else {
          let temp = { ...reviewCommentItem };
          reviewCommentItem = await this.reviewCommentItemRepo.findOne({
            item_id: reviewCommentItem['parent_item_id'],
          });

          reviewCommentItem['children'] = [temp];

          reviewCommentResults = [...reviewCommentResults, reviewCommentItem];
        }
        continue;
      }

      if (reviewCommentItem.type === 1) {
        reviewCommentItem['review'] = {};
        let review = await this.reviewRepo.findOne({
          product_id: reviewCommentItem.product_id,
        });
        if (review) {
          reviewCommentItem['review'] = review;
        }
      }

      reviewCommentItem['children'] = [];
      reviewCommentResults = [...reviewCommentResults, reviewCommentItem];
    }

    let count = await this.reviewCommentItemRepo.find({
      select: `COUNT(product_id) as total`,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      items: reviewCommentResults,
    };
  }

  async getCommentReviewResponse(item_id: number, params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let responseReviews = await this.reviewCommentItemRepo.find({
      parent_item_id: item_id,
      skip,
      limit,
    });
    if (responseReviews.length) {
      for (let responseReview of responseReviews) {
        responseReview['images'] = [];
        const images = await this.imageLinkRepo.find({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: responseReview.item_id,
        });

        if (images.length) {
          for (let imageItem of images) {
            const imageLink = await this.imageRepo.findOne({
              image_id: imageItem.image_id,
            });
            responseReview['images'].push(imageLink);
          }
        }
      }
    }

    return responseReviews;
  }

  async createReviewComment(data, product_id: number, type) {
    let email = data?.email || null;
    let phone = data?.phone;
    let fullname = data.fullname;

    const checkAllowComment = await this.productRepo.findOne({
      product_id,
      allow_comment: 'Y',
    });
    if (!checkAllowComment) {
      throw new HttpException(
        'Sản phẩm hiện tại không thể bình luận, đánh giá.',
        403,
      );
    }

    if (data.point && data.parent_item_id) {
      throw new HttpException('Không thể đánh giá SP bằng phản hồi', 400);
    }

    if (type == 1 && data.point && !data.parent_item_id) {
      const checkReviewExist = await this.reviewCommentItemRepo.findOne({
        product_id,
        phone,
      });
      if (checkReviewExist) {
        throw new HttpException(
          'Người dùng đã đánh giá bài viết, không thể đánh giá thêm',
          400,
        );
      }
    }

    let comment = '';
    let suitableLevel = 1;
    let rawComment = comment;
    if (data.comment) {
      comment = data.comment;
      rawComment = comment;
      let restrictedComments = await this.restrictedCommentRepo.findOne({});
      if (
        restrictedComments &&
        restrictedComments.keywords &&
        new RegExp(
          checkRestrictedCommentsListIntoRegularExpress(
            restrictedComments.keywords,
          ),
          'gi',
        ).test(comment)
      ) {
        suitableLevel = 2;
        comment = comment.replace(
          new RegExp(
            checkRestrictedCommentsListIntoRegularExpress(
              restrictedComments.keywords,
            ),
            'gi',
          ),
          '***',
        );
      }
    }

    let reviewItemData = {
      ...new ReviewCommentItemsEntity(),
      ...this.reviewCommentItemRepo.setData(data),
      comment,
      raw_comment: rawComment,
      product_id,
      email,
      phone,
      fullname,
      type,
    };

    if (type == 1 && data.point) {
      if (data.point < 3) {
        suitableLevel = 3;
      }
      if (data.point < 5) {
        suitableLevel = 2;
      }
    }

    reviewItemData['suitable_level'] = suitableLevel;

    const reviewComment = await this.reviewCommentItemRepo.create(
      reviewItemData,
    );

    if (data.parent_item_id) {
      await this.reviewCommentItemRepo.update(
        { item_id: data.parent_item_id },
        { updated_at: formatStandardTimeStamp() },
      );
    }

    if (data?.images && data?.images?.length) {
      for (let imageItem of data.images) {
        const image = await this.imageRepo.create({ image_path: imageItem });
        if (image) {
          await this.imageLinkRepo.create({
            object_type: ImageObjectType.COMMENT_REVIEWS,
            object_id: reviewComment.item_id,
            image_id: image.image_id,
          });
        }
      }
    }

    if (type !== 1 || !data.point) return;

    const review = await this.reviewRepo.findOne({ product_id });
    const reviewItems = await this.reviewCommentItemRepo.find({
      select: '*',
      where: {
        [`${Table.REVIEW_COMMENT_ITEMS}.product_id`]: product_id,
        status: 'A',
        type: 1,
        point: Between(1, 5),
      },
    });
    let _sum = 0;
    let _count = 0;
    let _ratings = Array.from({ length: 5 }).map((_) => 0);
    if (reviewItems.length) {
      for (let reviewItem of reviewItems) {
        _sum += reviewItem['point'];
        _count++;
        _ratings[+reviewItem.point - 1] += 1;
      }
    }
    let avgPoint = (_sum / _count).toPrecision(2);

    if (review) {
      await this.reviewRepo.update(
        { review_id: review.review_id },
        {
          avg_point: avgPoint,
          count: _count,
          ratings: JSON.stringify(_ratings),
          updated_at: formatStandardTimeStamp(),
        },
      );
    } else {
      await this.reviewRepo.create({
        product_id,
        count: _count,
        avg_point: avgPoint,
        ratings: JSON.stringify(_ratings),
      });
    }
  }

  async getReviewsCommentsListWebsite(product_id: number, params, type) {
    let { page, skip, limit } = getPageSkipLimit(params);

    const checkAllowComment = await this.productRepo.findOne({
      product_id,
      allow_comment: 'Y',
    });
    if (!checkAllowComment) {
      throw new HttpException(
        'Sản phẩm hiện tại không thể bình luận, đánh giá.',
        403,
      );
    }
    const reviewCommentItems = await this.reviewCommentItemRepo.find({
      select: '*',
      where: {
        product_id,
        type,
        status: 'A',
        parent_item_id: IsNull(),
      },
      orderBy: [
        {
          field: `${Table.REVIEW_COMMENT_ITEMS}.updated_at`,
          sortBy: SortBy.DESC,
        },
      ],
      skip,
      limit,
    });

    const count = await this.reviewCommentItemRepo.find({
      select: 'COUNT(item_id) as total',
      where: {
        product_id,
        type,
        status: 'A',
        parent_item_id: IsNull(),
      },
    });

    if (reviewCommentItems.length) {
      for (let reviewItem of reviewCommentItems) {
        reviewItem['images'] = [];
        const images = await this.imageLinkRepo.find({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: reviewItem.item_id,
        });
        if (images.length) {
          for (let imageItem of images) {
            const imageLink = await this.imageRepo.findOne({
              image_id: imageItem.image_id,
            });
            reviewItem['images'].push(imageLink);
          }
        }

        reviewItem['responses'] = [];
        let responseReviews = await this.reviewCommentItemRepo.find({
          select: '*',
          orderBy: [
            {
              field: `${Table.REVIEW_COMMENT_ITEMS}.updated_at`,
              sortBy: SortBy.DESC,
            },
          ],
          where: {
            parent_item_id: reviewItem.item_id,
            status: 'A',
          },
        });
        if (responseReviews.length) {
          for (let responseReview of responseReviews) {
            responseReview['images'] = [];
            const images = await this.imageLinkRepo.find({
              object_type: ImageObjectType.COMMENT_REVIEWS,
              object_id: responseReview.item_id,
            });

            if (images.length) {
              for (let imageItem of images) {
                const imageLink = await this.imageRepo.findOne({
                  image_id: imageItem.image_id,
                });
                responseReview['images'].push(imageLink);
              }
            }
            reviewItem['responses'].push(responseReview);
          }
        }
      }
    }

    if (type == 1) {
      const review = await this.reviewRepo.findOne({ product_id });
      return {
        paging: { currentPage: page, pageSize: limit, total: count[0].total },
        summary: review,
        items: reviewCommentItems,
      };
    }
    return {
      paging: { currentPage: page, pageSize: limit, total: count[0].total },
      items: reviewCommentItems,
    };
  }

  async getReviewsListCMS(params, type) {
    let { product_id, search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);
    let filterConditions: object = {};

    if (type) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.type`] = type;
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.parent_item_id`] =
        IsNull();
    }

    if (product_id) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.product_id`] = product_id;
    }

    const reviews = await this.reviewCommentItemRepo.find({
      select: '*',
      where: reviewCommentItemsSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.reviewCommentItemRepo.find({
      select: `COUNT(product_id) as total`,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
    });

    if (reviews.length) {
      for (let reviewItem of reviews) {
        reviewItem['images'] = [];
        const images = await this.imageLinkRepo.find({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: reviewItem.item_id,
        });
        if (images.length) {
          for (let imageItem of images) {
            const imageLink = await this.imageRepo.findOne({
              image_id: imageItem.image_id,
            });
            reviewItem['images'].push(imageLink);
          }
        }
      }
    }

    if (type == 1) {
      const reviewSummary = reviews.length
        ? await this.reviewRepo.find({
            product_id: In(reviews.map(({ product_id }) => product_id)),
          })
        : null;
      return {
        paging: {
          currentPage: page,
          pageSize: limit,
          total: count[0].total,
        },
        items: reviews,
        summary: reviewSummary,
      };
    }
    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      items: reviews,
    };
  }

  async getCommentsReviewsList(params) {
    let { search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    let filterConditions = {};
    if (!search) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.parent_item_id`] =
        IsNull();
    }

    const reviewCommentItems = await this.reviewCommentItemRepo.find({
      select: `*, ${Table.REVIEW_COMMENT_ITEMS}.status, ${Table.PRODUCTS}.slug as productSlug`,
      join: reviewCommentProductJoiner,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let reviewCommentResults = [];
    for (let reviewCommentItem of reviewCommentItems) {
      if (
        reviewCommentItem['parent_item_id'] &&
        reviewCommentItem['parent_item_id'] != 0
      ) {
        if (
          reviewCommentResults.length &&
          reviewCommentResults.some(
            ({ item_id }) => item_id == reviewCommentItem['parent_item_id'],
          )
        ) {
          reviewCommentResults = reviewCommentResults.map((item) => {
            if (item.item_id == reviewCommentItem['parent_item_id']) {
              item['children'] = item['children']
                ? [...item['children'], reviewCommentItem]
                : [reviewCommentItem];
            }
            return item;
          });
        } else {
          let temp = { ...reviewCommentItem };
          reviewCommentItem = await this.reviewCommentItemRepo.findOne({
            item_id: reviewCommentItem['parent_item_id'],
          });

          reviewCommentItem['children'] = [temp];

          reviewCommentResults = [...reviewCommentResults, reviewCommentItem];
        }
        continue;
      }

      if (reviewCommentItem.type === 1) {
        reviewCommentItem['review'] = {};
        let review = await this.reviewRepo.findOne({
          product_id: reviewCommentItem.product_id,
        });
        if (review) {
          reviewCommentItem['review'] = review;
        }
      }

      reviewCommentItem['children'] = [];
      reviewCommentResults = [...reviewCommentResults, reviewCommentItem];
    }

    let count = await this.reviewCommentItemRepo.find({
      select: `COUNT(product_id) as total`,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      items: reviewCommentResults,
    };
  }

  async createReviewCommentCMS(
    data: CreateCommentReviewCMSDto,
    product_id,
    user,
  ) {
    let email = user.email;
    let phone = user.phone;
    let fullname = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();

    let reviewItemData = {
      ...new ReviewCommentItemsEntity(),
      ...this.reviewCommentItemRepo.setData(data),
      product_id,
      email: email || null,
      phone,
      fullname,
      user_id: user.user_id,
      type: data.type,
    };

    const reviewComment = await this.reviewCommentItemRepo.create(
      reviewItemData,
    );

    if (data?.images && data?.images?.length) {
      for (let imageItem of data.images) {
        const image = await this.imageRepo.create({ image_path: imageItem });
        if (image) {
          await this.imageLinkRepo.create({
            object_type: ImageObjectType.COMMENT_REVIEWS,
            object_id: reviewComment.item_id,
            image_id: image.image_id,
          });
        }
      }
    }
  }

  async createCommentCMS(data: CreateCommentCMSDto, product_id, user) {
    let email = user.email;
    let phone = user.phone;
    let fullname = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();

    let repliedItemId = null;
    let parentItemId = data.parent_item_id;

    if (data.reply_item_id) {
      let repliedComment = await this.reviewCommentItemRepo.findOne({
        item_id: data.reply_item_id,
      });
      if (repliedComment) {
        repliedItemId = repliedComment.item_id;
        parentItemId = repliedComment.parent_item_id
          ? repliedComment.parent_item_id
          : repliedComment.item_id;
      }
    }

    let comment = '';
    let suitableLevel = 1;
    let rawComment = comment;
    if (data.comment) {
      comment = data.comment;
      rawComment = comment;
      let restrictedComments = await this.restrictedCommentRepo.findOne({});
      if (
        restrictedComments &&
        restrictedComments.keywords &&
        new RegExp(
          checkRestrictedCommentsListIntoRegularExpress(
            restrictedComments.keywords,
          ),
          'gi',
        ).test(comment)
      ) {
        suitableLevel = 2;
        comment = comment.replace(
          new RegExp(
            checkRestrictedCommentsListIntoRegularExpress(
              restrictedComments.keywords,
            ),
            'gi',
          ),
          '***',
        );
      }
    }

    let reviewItemData = {
      ...new ReviewCommentItemsEntity(),
      ...this.reviewCommentItemRepo.setData(data),
      product_id,
      comment,
      raw_comment: rawComment,
      parent_item_id: parentItemId,
      email: email || null,
      phone,
      fullname,
      user_id: user.user_id,
      type: data.type,
      is_replied: 'Y',
    };

    const reviewComment = await this.reviewCommentItemRepo.create(
      reviewItemData,
    );

    if (repliedItemId) {
      await this.reviewCommentItemRepo.update(
        { item_id: repliedItemId },
        { is_replied: 'Y' },
      );
    }

    if (data?.images && data?.images?.length) {
      for (let imageItem of data.images) {
        const image = await this.imageRepo.create({ image_path: imageItem });
        if (image) {
          await this.imageLinkRepo.create({
            object_type: ImageObjectType.COMMENT_REVIEWS,
            object_id: reviewComment.item_id,
            image_id: image.image_id,
          });
        }
      }
    }
  }
}
