import { Injectable, HttpException } from '@nestjs/common';
import { RestrictedCommentEntity } from '../entities/restrictedComment.entity';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewCommentItemsEntity } from '../entities/reviewCommentItems.entity';
import { RestrictedCommentRepository } from '../repositories/restrictedComment.repository';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewCommentItemRepository } from '../repositories/reviewCommentItem.repository';
import { reviewCommentProductJoiner } from '../../database/sqlQuery/join/product.join';
import { reviewCommentItemsSearchFilter } from '../../utils/tableConditioner';
import {
  IsNull,
  In,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from '../../database/operators/operators';
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
import { DatabaseService } from '../../database/database.service';
import { ReviewCommentUserIPRepository } from '../repositories/reviewCommentUserIP.repository';
import { ReviewCommentUserIPEntity } from '../entities/reviewCommentUserIP.entity';
import { RedisCacheService } from './redisCache.service';
import { cacheKeys } from '../../utils/cache.utils';
import { reviewCommentJoiner } from '../../utils/joinTable';

@Injectable()
export class ReviewsCommentService {
  constructor(
    private restrictedCommentRepo: RestrictedCommentRepository<RestrictedCommentEntity>,
    private reviewRepo: ReviewRepository<ReviewEntity>,
    private reviewCommentItemRepo: ReviewCommentItemRepository<ReviewCommentItemsEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private db: DatabaseService,
    private reviewCommentUserIPRepo: ReviewCommentUserIPRepository<ReviewCommentUserIPEntity>,
    private cache: RedisCacheService,
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
    let {
      search,
      product_id,
      point,
      suitable_level,
      is_replied,
      status,
      created_at_start,
      created_at_end,
    } = params;
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

    if (status) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.status`] = status;
    }

    if (created_at_start && created_at_end) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.created_at`] = Between(
        created_at_start,
        created_at_end,
      );
    } else if (created_at_start) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.created_at`] =
        MoreThanOrEqual(created_at_start);
    } else if (created_at_end) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.created_at`] =
        LessThanOrEqual(created_at_start);
    }

    let joinSqlConditions = '';
    if (search) {
      joinSqlConditions += joinSqlConditions
        ? `AND ddv_review_comment_items.comment LIKE '%${search}%'`
        : `ddv_review_comment_items.comment LIKE '%${search}%'`;
    }
    if (point) {
      joinSqlConditions += joinSqlConditions
        ? `AND type = 1 AND point = ${point} `
        : `type = 1 AND point = ${point} `;
    }

    let filterConditionsWithoutPoint: object = { ...filterConditions };

    if (created_at_start && created_at_end) {
      filterConditionsWithoutPoint[
        `${Table.REVIEW_COMMENT_ITEMS}.created_at`
      ] = `BETWEEN '${created_at_start}' AND '${created_at_end}' `;
    } else if (created_at_start) {
      filterConditionsWithoutPoint[
        `${Table.REVIEW_COMMENT_ITEMS}.created_at`
      ] = `>= '${created_at_start}' `;
    } else if (created_at_end) {
      filterConditionsWithoutPoint[
        `${Table.REVIEW_COMMENT_ITEMS}.created_at`
      ] = `<= '${created_at_end}' `;
    }

    delete filterConditionsWithoutPoint[`${Table.REVIEW_COMMENT_ITEMS}.point`];

    if (Object.entries(filterConditionsWithoutPoint).length) {
      for (let [key, val] of Object.entries(filterConditionsWithoutPoint)) {
        if (key === `${Table.REVIEW_COMMENT_ITEMS}.created_at`) {
          joinSqlConditions += joinSqlConditions
            ? `AND ${key} ${val} `
            : `${key} ${val} `;
          continue;
        }
        joinSqlConditions += joinSqlConditions
          ? `AND ${key} = '${val}' `
          : `${key} = '${val}' `;
      }
    }

    let sql = '';
    let countSql = '';

    sql = joinSqlConditions
      ? `select distinct(result.item_id), result.*, ${Table.PRODUCT_DESCRIPTION}.*
        from (( SELECT *
        from ddv_review_comment_items
        where item_id in ( SELECT  parent_item_id FROM ddv_review_comment_items WHERE ddv_review_comment_items.parent_item_id IS NOT NULL AND ${joinSqlConditions}) )
        union all 
        (SELECT * FROM ddv_review_comment_items WHERE parent_item_id is null AND ${joinSqlConditions})
        ) as result LEFT JOIN ${Table.PRODUCT_DESCRIPTION} ON ${Table.PRODUCT_DESCRIPTION}.product_id = result.product_id 
        ORDER BY updated_at DESC
        LIMIT ${limit}
        OFFSET ${skip};`
      : `select distinct(item_id), result.*,  ${Table.PRODUCT_DESCRIPTION}.*
        from ((select *
        from ddv_review_comment_items
        where item_id in ( SELECT  parent_item_id FROM ddv_review_comment_items WHERE ddv_review_comment_items.parent_item_id IS NOT NULL) )
        union all 
        (SELECT * FROM ddv_review_comment_items WHERE parent_item_id is null)
        ) as result LEFT JOIN ${Table.PRODUCT_DESCRIPTION} ON ${Table.PRODUCT_DESCRIPTION}.product_id = result.product_id 
        ORDER BY updated_at DESC
        LIMIT ${limit}
        OFFSET ${skip};`;
    countSql = joinSqlConditions
      ? `SELECT COUNT(DISTINCT(item_id)) as total
        FROM ((SELECT item_id, parent_item_id, updated_at
        FROM ddv_review_comment_items
        WHERE item_id IN ( SELECT  parent_item_id FROM ddv_review_comment_items WHERE ddv_review_comment_items.parent_item_id IS NOT NULL AND ${joinSqlConditions}   ) )
        UNION ALL 
        (SELECT item_id, parent_item_id, updated_at FROM ddv_review_comment_items WHERE parent_item_id IS NULL AND ${joinSqlConditions} )
        ) AS result;`
      : `SELECT COUNT(DISTINCT(item_id)) as total 
        FROM ((SELECT item_id, parent_item_id, updated_at
        FROM ddv_review_comment_items
        WHERE item_id IN ( SELECT  parent_item_id FROM ddv_review_comment_items WHERE ddv_review_comment_items.parent_item_id IS NOT NULL ) )
        UNION ALL 
        (SELECT item_id, parent_item_id, updated_at FROM ddv_review_comment_items WHERE parent_item_id IS NULL )
        ) AS result `;

    let sqlResponse = await this.db.executeQueryReadPool(sql);
    let countSqlResponse = await this.db.executeQueryReadPool(countSql);

    let parentReviewCommentItems = sqlResponse[0].map((item) => item);

    let total = countSqlResponse[0][0]?.total || 0;

    let reviewCommentResults = [];
    for (let parentReviewCommentItem of parentReviewCommentItems) {
      let imageLinks = await this.imageLinkRepo.find({
        object_type: ImageObjectType.COMMENT_REVIEWS,
        object_id: parentReviewCommentItem.item_id,
      });
      parentReviewCommentItem['images'] = [];
      if (imageLinks.length) {
        for (let imageLink of imageLinks) {
          let image = await this.imageRepo.findOne({
            image_id: imageLink.image_id,
          });
          parentReviewCommentItem['images'].push(image);
        }
      }

      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.parent_item_id`] =
        parentReviewCommentItem.item_id;
      let childrenReviewCommentItems = await this.reviewCommentItemRepo.find({
        select: '*',
        where: reviewCommentItemsSearchFilter(search, filterConditions),
      });
      if (childrenReviewCommentItems.length) {
        for (let childReviewCommentItem of childrenReviewCommentItems) {
          let imageLinks = await this.imageLinkRepo.find({
            object_type: ImageObjectType.COMMENT_REVIEWS,
            object_id: childReviewCommentItem.item_id,
          });
          childReviewCommentItem['images'] = [];
          if (imageLinks.length) {
            for (let imageLink of imageLinks) {
              let image = await this.imageRepo.findOne({
                image_id: imageLink.image_id,
              });
              childReviewCommentItem['images'].push(image);
            }
          }
          childReviewCommentItem['parentUserFullName'] =
            parentReviewCommentItem.fullname;
        }
      }
      parentReviewCommentItem['children'] = childrenReviewCommentItems;

      if (parentReviewCommentItem.type === 1) {
        parentReviewCommentItem['review'] = {};
        let review = await this.reviewRepo.findOne({
          product_id: parentReviewCommentItem.product_id,
        });
        if (review) {
          parentReviewCommentItem['review'] = review;
        }
      }

      reviewCommentResults = [...reviewCommentResults, parentReviewCommentItem];
    }

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total,
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

  async createReviewComment(data, product_id: number, type, userIp) {
    const checkUserIp = await this.reviewCommentUserIPRepo.findOne({
      user_ip: userIp,
    });
    if (checkUserIp && checkUserIp['last_comment']) {
      let now = Date.now();
      let lastComment = new Date(checkUserIp['last_comment']).getTime();
      let restrictedTime = 3 * 60 * 1000;
      if (now < lastComment + restrictedTime) {
        throw new HttpException(
          `Vui lòng chờ trong ${
            (lastComment + restrictedTime - now) / 1000
          }s để bình luận tiếp theo`,
          400,
        );
      }
    }

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
      if (data.point < 4) {
        suitableLevel = 2;
      }
      if (data.point <= 2) {
        suitableLevel = 3;
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

    if (checkUserIp) {
      await this.reviewCommentUserIPRepo.update(
        { user_ip: userIp },
        { last_comment: formatStandardTimeStamp() },
      );
    } else {
      await this.reviewCommentUserIPRepo.create({
        user_ip: userIp,
        last_comment: formatStandardTimeStamp(),
      });
    }

    //=========== Remove product cache ==============
    if (type === 1) {
      let productCacheKey = cacheKeys.product(product_id);
      this.cache.delete(productCacheKey);
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
    let { point } = params;
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

    let filterConditions = {
      product_id,
      [`${Table.REVIEW_COMMENT_ITEMS}.type`]: type,
      [`${Table.REVIEW_COMMENT_ITEMS}.status`]: 'A',
      parent_item_id: IsNull(),
    };

    if (point >= 0 && point <= 5) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.point`] = point;
    }

    const _reviewCommentItems = this.reviewCommentItemRepo.find({
      select: `*`,
      join: reviewCommentJoiner,
      where: filterConditions,
      orderBy: [
        {
          field: `${Table.REVIEW_COMMENT_ITEMS}.updated_at`,
          sortBy: SortBy.DESC,
        },
      ],
      skip,
      limit,
    });

    const _count = this.reviewCommentItemRepo.find({
      select: 'COUNT(item_id) as total',
      join: reviewCommentJoiner,
      where: filterConditions,
    });

    let [reviewCommentItems, count] = await Promise.all([
      _reviewCommentItems,
      _count,
    ]);

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
