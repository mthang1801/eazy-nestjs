import { Injectable, HttpException, ConsoleLogger } from '@nestjs/common';
import { CreatePageDto } from '../dto/page/create-page.dto';
import { PageEntity } from '../entities/page.entity';
import { PageDetailEntity } from '../entities/pageDetail.entity';
import { PageRepository } from '../repositories/page.repository';
import { PageDetailRepository } from '../repositories/pageDetail.repository';
import { PageDetailValueRepository } from '../repositories/pageDetailValue.repository';
import { PageDetailValueEntity } from '../entities/pageDetailValue.entity';
import {
  removeMoreThanOneSpace,
  formatStandardTimeStamp,
} from '../../utils/helper';
import { genRandomString } from '../../utils/cipherHelper';
import { CreatePageDetailDto } from '../dto/page/create-pageDetail.dto';
import { UpdatePageDetailDto } from '../dto/page/update-pageDetail.dto';
import { getPageSkipLimit, isJsonString } from '../../utils/helper';

import { Table } from 'src/database/enums';
import { pagesListSearchFilter } from '../../utils/tableConditioner';
import { IGetPagesFilters } from '../interfaces/pages/getPagesFitlers.interface';
import { sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CreatePageDetailValuesDto } from '../dto/page/create-pageDetailValues.dto';
import { UpdatePageDetailValueDto } from '../dto/page/update-pageDetailValue.dto';
import { CreatePageDetailValueDto } from '../dto/page/create-pageDetailValue.dto';
import { CreatePageDetailItemDto } from '../dto/page/create-pageDetailItem.dto';
import { CreateOrUpdatePageDetailDto } from '../dto/page-tester/create-update-pageDetailItem.dto';
import { UpdatePageDetailsPosition } from '../dto/page-tester/update-pageDetailsPosition.dto';
import {
  pageProgramDetailJoiner,
  pageProgramDetailValueJoiner,
} from '../../utils/joinTable';
import { CreateOrUpdatePageDetailValueItemDto } from '../dto/page-tester/create-update-pageDetailValueItem.dto';
import { UpdatePageDetailValuesPositionDto } from '../dto/page-tester/update-pageDetailValuesPosition.dto';
import {
  PageDetailType,
  PageDetailValueType,
} from '../../constants/page.constant';
import {
  productLeftJoiner,
  pageDetailValueJoiner,
} from '../../utils/joinTable';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { BOX_PRODUCTLeftJoiner } from '../../utils/joinTable';
import { ProductService } from './products.service';
import { ReviewRepository } from '../repositories/review.repository';
import {
  getProductsListSelectorBE,
  getDetailProductsListSelectorFE,
} from '../../utils/tableSelector';
import { ReviewEntity } from '../entities/review.entity';
import { bannerService } from './banner.service';
import { FlashSaleRepository } from '../repositories/flashSale.repository';
import { FlashSaleEntity } from '../entities/flashSale.entity';
import { FlashSalesService } from './flashSale.service';
import { RedisCacheService } from './redisCache.service';
import * as _ from 'lodash';
import { CDN_URL } from '../../constants/api.appcore';
@Injectable()
export class PageService {
  constructor(
    private pageRepo: PageRepository<PageEntity>,
    private pageDetailRepo: PageDetailRepository<PageDetailEntity>,
    private pageDetailValueRepo: PageDetailValueRepository<PageDetailValueEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productService: ProductService,
    private reviewRepo: ReviewRepository<ReviewEntity>,
    private bannerService: bannerService,
    private flashSaleService: FlashSalesService,
    private cache: RedisCacheService,
  ) {}
  async createPage(data: CreatePageDto) {
    const pages = await this.pageRepo.find();
    if (
      pages.length &&
      pages.some(
        ({ page_name }) =>
          page_name.toLowerCase().trim() ==
          removeMoreThanOneSpace(data.page_name).toLocaleLowerCase().trim(),
      )
    ) {
      throw new HttpException('Tên page đã tồn tại.', 409);
    }

    const newPageData = {
      ...new PageEntity(),
      ...this.pageRepo.setData(data),
      page_name: removeMoreThanOneSpace(data.page_name),
    };
    const newPage = await this.pageRepo.create(newPageData);

    if (data.page_details && data.page_details.length) {
      for (let pageDetail of data.page_details) {
        const pageDetails = await this.pageDetailRepo.find({
          page_id: newPage.page_id,
        });
        if (
          pageDetails.length &&
          pageDetails.some(
            ({ module_name }) =>
              module_name.toLowerCase().trim() ==
              removeMoreThanOneSpace(pageDetail.module_name)
                .toLowerCase()
                .trim(),
          )
        ) {
          pageDetail['module_name'] = `${
            pageDetail['module_name']
          }-${genRandomString(6)}`;
        }

        const pageDetailData = {
          ...new PageDetailEntity(),
          ...this.pageDetailRepo.setData(pageDetail),
          module_name: removeMoreThanOneSpace(pageDetail.module_name),
          page_id: newPage.page_id,
        };
        const newPageDetail = await this.pageDetailRepo.create(pageDetailData);

        if (
          pageDetail.page_detail_values &&
          pageDetail.page_detail_values.length
        ) {
          for (let pageDetailValue of pageDetail.page_detail_values) {
            let detailValues = await this.pageDetailValueRepo.find({
              page_detail_id: newPageDetail.page_detail_id,
            });
            if (
              detailValues.length &&
              detailValues.some(
                ({ page_detail_name: name }) =>
                  name.toLowerCase().trim() ==
                  removeMoreThanOneSpace(pageDetailValue.page_detail_name)
                    .toLowerCase()
                    .trim(),
              )
            ) {
              pageDetailValue['page_detail_name'] = `${
                pageDetailValue['page_detail_name']
              }-${genRandomString(6)}`;
            }
            const pageDetailValueData = {
              ...new PageDetailValueEntity(),
              ...this.pageDetailValueRepo.setData(pageDetailValue),
              page_detail_name: removeMoreThanOneSpace(
                pageDetailValue.page_detail_name,
              ),
              page_detail_id: newPageDetail.page_detail_id,
            };
            await this.pageDetailValueRepo.create(pageDetailValueData);
          }
        }
      }
    }
  }
  async updatePage(page_id: number, data: CreatePageDto) {
    const currentPage = await this.pageRepo.findOne({ page_id });
    if (!currentPage) {
      throw new HttpException('Không tìm thấy trang', 404);
    }

    if (data.page_name) {
      const pages = await this.pageRepo.find();
      if (
        pages.length &&
        pages.some(
          ({ page_id: pageId, page_name }) =>
            page_name.toLowerCase().trim() ==
              removeMoreThanOneSpace(data.page_name)
                .toLocaleLowerCase()
                .trim() && page_id != pageId,
        )
      ) {
        throw new HttpException('Tên page đã tồn tại.', 409);
      }
    }

    const updatedPageData = {
      ...this.pageRepo.setData(data),
      page_name: data.page_name
        ? removeMoreThanOneSpace(data.page_name)
        : currentPage.page_name,
      updated_at: formatStandardTimeStamp(),
    };
    await this.pageRepo.update({ page_id }, updatedPageData);

    if (data.page_details && data.page_details.length) {
      await this.pageDetailRepo.delete({ page_id });
      for (let pageDetail of data.page_details) {
        const pageDetails = await this.pageDetailRepo.find({
          page_id,
        });
        if (
          pageDetails.length &&
          pageDetails.some(
            ({ module_name }) =>
              module_name.toLowerCase().trim() ==
              removeMoreThanOneSpace(pageDetail.module_name)
                .toLowerCase()
                .trim(),
          )
        ) {
          pageDetail['module_name'] = `${
            pageDetail['module_name']
          }-${genRandomString(6)}`;
        }

        const pageDetailData = {
          ...new PageDetailEntity(),
          ...this.pageDetailRepo.setData(pageDetail),
          module_name: removeMoreThanOneSpace(pageDetail.module_name),
          page_id,
        };
        const newPageDetail = await this.pageDetailRepo.create(pageDetailData);

        if (
          pageDetail.page_detail_values &&
          pageDetail.page_detail_values.length
        ) {
          for (let pageDetailValue of pageDetail.page_detail_values) {
            let detailValues = await this.pageDetailValueRepo.find({
              page_detail_id: newPageDetail.page_detail_id,
            });
            if (
              detailValues.length &&
              detailValues.some(
                ({ page_detail_name: name }) =>
                  name.toLowerCase().trim() ==
                  removeMoreThanOneSpace(pageDetailValue.page_detail_name)
                    .toLowerCase()
                    .trim(),
              )
            ) {
              pageDetailValue['page_detail_name'] = `${
                pageDetailValue['page_detail_name']
              }-${genRandomString(6)}`;
            }
            const pageDetailValueData = {
              ...new PageDetailValueEntity(),
              ...this.pageDetailValueRepo.setData(pageDetailValue),
              page_detail_name: removeMoreThanOneSpace(
                pageDetailValue.page_detail_name,
              ),
              page_detail_id: newPageDetail.page_detail_id,
            };
            await this.pageDetailValueRepo.create(pageDetailValueData);
          }
        }
      }
    }
  }
  async createPageDetail(page_id: number, data: CreatePageDetailDto) {
    const currentPage = await this.pageRepo.findOne({ page_id });

    if (!currentPage) {
      throw new HttpException('Không tìm thấy trang.', 404);
    }

    const updatedPageData = {
      updated_at: formatStandardTimeStamp(),
    };
    await this.pageRepo.update({ page_id }, updatedPageData);

    if (data.page_details && data.page_details.length) {
      await this.pageDetailRepo.delete({ page_id });
      for (let pageDetailItem of data.page_details) {
        const pageDetails = await this.pageDetailRepo.find({
          page_id,
        });
        if (
          pageDetails.length &&
          pageDetails.some(
            ({ module_name }) =>
              module_name.toLowerCase().trim() ==
              removeMoreThanOneSpace(pageDetailItem.module_name)
                .toLowerCase()
                .trim(),
          )
        ) {
          throw new HttpException('Tên Module trong trang đã tồn tại', 409);
        }

        const pageDetailData = {
          ...new PageDetailEntity(),
          ...this.pageDetailRepo.setData(pageDetailItem),
          module_name: removeMoreThanOneSpace(pageDetailItem.module_name),
          page_id,
        };
        const newPageDetail = await this.pageDetailRepo.create(pageDetailData);

        if (
          pageDetailItem.page_detail_values &&
          pageDetailItem.page_detail_values.length
        ) {
          for (let pageDetailValue of pageDetailItem.page_detail_values) {
            let detailValues = await this.pageDetailValueRepo.find({
              page_detail_id: newPageDetail.page_detail_id,
            });
            if (
              detailValues.length &&
              detailValues.some(
                ({ page_detail_name: name }) =>
                  name.toLowerCase().trim() ==
                  removeMoreThanOneSpace(pageDetailValue.page_detail_name)
                    .toLowerCase()
                    .trim(),
              )
            ) {
              pageDetailValue['page_detail_name'] = `${
                pageDetailValue['page_detail_name']
              }-${genRandomString(6)}`;
            }
            const pageDetailValueData = {
              ...new PageDetailValueEntity(),
              ...this.pageDetailValueRepo.setData(pageDetailValue),
              page_detail_name: removeMoreThanOneSpace(
                pageDetailValue.page_detail_name,
              ),
              page_detail_id: newPageDetail.page_detail_id,
            };
            await this.pageDetailValueRepo.create(pageDetailValueData);
          }
        }
      }
    }
  }

  async updatePageDetail(page_id: number, data: UpdatePageDetailDto) {
    const currentPage = await this.pageRepo.findOne({ page_id });

    if (!currentPage) {
      throw new HttpException('Không tìm thấy trang.', 404);
    }

    const updatedPageData = {
      updated_at: formatStandardTimeStamp(),
    };
    await this.pageRepo.update({ page_id }, updatedPageData);

    if (data.page_details && data.page_details.length) {
      for (let pageDetailItem of data.page_details) {
        await this.pageDetailRepo.update(
          { page_detail_id: pageDetailItem.page_detail_id },
          { position: pageDetailItem.position },
        );
      }
    }
  }

  async updatePageDetailStatus(page_detail_id, status: string) {
    const updatedPageDetail = await this.pageDetailRepo.update(
      { page_detail_id },
      { status },
      true,
    );

    if (updatedPageDetail) {
      await this.pageRepo.update(
        { page_id: updatedPageDetail.page_id },
        { updated_at: formatStandardTimeStamp() },
      );
    }
  }

  async createPageDetailValues(
    page_detail_id: number,
    data: CreatePageDetailValuesDto,
  ) {
    if (data.page_detail_values && data.page_detail_values.length) {
      await this.pageDetailValueRepo.delete({ page_detail_id });
      for (let pageDetailValue of data.page_detail_values) {
        const newPageDetailData = {
          ...new PageDetailValueEntity(),
          ...this.pageDetailValueRepo.setData(pageDetailValue),
          page_detail_id,
        };
        await this.pageDetailValueRepo.create(newPageDetailData, false);
      }
    }
  }

  async createPageDetailValue(page_detail_id, data: CreatePageDetailValueDto) {
    if (data.value_id) {
      const updatedPageDetailValueData = this.pageDetailValueRepo.setData(data);
      if (Object.entries(updatedPageDetailValueData).length) {
        await this.pageDetailValueRepo.update(
          { value_id: data.value_id },
          updatedPageDetailValueData,
        );
      }
    } else {
      const newPageDetailValueData = {
        ...new PageDetailValueEntity(),
        ...this.pageDetailValueRepo.setData(data),
        page_detail_id,
      };
      await this.pageDetailValueRepo.create(newPageDetailValueData);
    }
  }

  async updatePageDetailValueStatus(value_id, status) {
    return this.pageDetailValueRepo.update({ value_id }, { status });
  }

  async updatePageDetailValues(
    page_detail_id: number,
    data: UpdatePageDetailValueDto,
  ) {
    if (data.page_detail_values && data.page_detail_values.length) {
      await this.pageDetailValueRepo.delete({ page_detail_id });
      for (let pageDetailValue of data.page_detail_values) {
        const newPageDetailValueData = {
          ...new PageDetailValueEntity(),
          ...this.pageDetailValueRepo.setData(pageDetailValue),
          page_detail_id,
        };

        await this.pageDetailRepo.create(newPageDetailValueData, false);
      }
    }
  }

  async getPages(params: IGetPagesFilters = {}) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { status, search } = params;
    let filterConditions = {};
    if (status) {
      filterConditions[`${Table.PAGE}.status`] = status;
    }

    const pages = await this.pageRepo.find({
      select: '*',
      where: pagesListSearchFilter(search, filterConditions),
      orderBy: [{ field: `${Table.PAGE}.updated_at`, sortBy: SortBy.DESC }],
      skip,
      limit,
    });
    const count = await this.pageRepo.find({
      select: `COUNT(${Table.PAGE}.page_id) as total`,
      where: pagesListSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        pageSize: limit,
        currentPage: page,
        total: count[0].total,
      },
      data: pages,
    };
  }

  async getPageDetail(page_id) {
    const currentPage = await this.pageRepo.findOne({ page_id });

    const pageDetails = await this.pageDetailRepo.find({
      select: '*',
      orderBy: [
        {
          field: `CASE WHEN ${Table.PAGE_DETAIL}.position`,
          sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.PAGE_DETAIL}.position ASC`,
        },
      ],
      where: {
        [`${Table.PAGE_DETAIL}.page_id`]: page_id,
      },
    });

    currentPage['page_details'] = pageDetails;

    return currentPage;
  }

  async getPageDetailValues(page_detail_id) {
    let currentPageDetail = await this.pageDetailRepo.findOne({
      page_detail_id,
    });
    if (!currentPageDetail) {
      throw new HttpException('Không tìm thấy trang chi tiết', 404);
    }

    const pageDetailValues = await this.pageDetailValueRepo.find({
      page_detail_id,
    });

    if (currentPageDetail.detail_type == PageDetailType.BOX_PRODUCT) {
      currentPageDetail['page_detail_values'] = { ...currentPageDetail };
      for (let detailValue of pageDetailValues) {
        if (detailValue.detail_type == 'LIST_PRODUCTS') {
          let product = await this.productRepo.findOne({
            select: getDetailProductsListSelectorFE,
            join: productLeftJoiner,
            where: { [`${Table.PRODUCTS}.product_id`]: detailValue.data_value },
          });
          detailValue = { ...detailValue, ...product };
        }

        currentPageDetail['page_detail_values'][detailValue.detail_type] =
          currentPageDetail['page_detail_values'][detailValue.detail_type]
            ? [
                ...currentPageDetail['page_detail_values'][
                  detailValue.detail_type
                ],
                detailValue,
              ]
            : [detailValue];
      }
    } else {
      currentPageDetail['page_detail_values'] = pageDetailValues;
    }

    return currentPageDetail['page_detail_values'];
  }

  async FEgetPageDetailValues(page_detail_id) {
    let currentPageDetail = await this.pageDetailRepo.findOne({
      page_detail_id,
    });
    if (!currentPageDetail) {
      throw new HttpException('Không tìm thấy trang chi tiết', 404);
    }

    const pageDetailValues = await this.pageDetailValueRepo.find({
      where: { page_detail_id, detail_status: 'A' },
      orderBy: [
        { field: `${Table.PAGE_DETAIL_VALUE}.position`, sortBy: SortBy.ASC },
      ],
    });

    switch (currentPageDetail.detail_type) {
      case PageDetailType.BOX_PRODUCT:
        let pageDetailValue = {};
        let products = await this.pageDetailValueRepo.find({
          select: getDetailProductsListSelectorFE,
          join: BOX_PRODUCTLeftJoiner,
          where: {
            page_detail_id,
            detail_type: PageDetailValueType.LIST_PRODUCTS,
          },
          orderBy: [
            {
              field: `${Table.PAGE_DETAIL_VALUE}.position`,
              sortBy: SortBy.ASC,
            },
            {
              field: `${Table.PAGE_DETAIL_VALUE}.position`,
              sortBy: SortBy.ASC,
            },
          ],
        });

        products = _.uniqBy(products, 'product_id');

        for (let productItem of products) {
          //find product Stickers
          productItem['stickers'] =
            await this.productService.getProductStickers(productItem, true);

          productItem['ratings'] = await this.reviewRepo.findOne({
            product_id: productItem['product_id'],
          });

          productItem['discount_programs'] =
            await this.productService.getDiscountProgramApplyProduct(
              productItem['product_id'],
            );
        }

        pageDetailValue[PageDetailValueType.LIST_PRODUCTS] = [...products];

        pageDetailValue[PageDetailValueType.LIST_TABS] =
          await this.pageDetailValueRepo.find({
            select: '*',
            where: {
              page_detail_id,
              detail_type: PageDetailValueType.LIST_TABS,
            },
          });

        pageDetailValue[PageDetailValueType.BACKGROUND] =
          await this.pageDetailValueRepo.findOne({
            page_detail_id,
            detail_type: PageDetailValueType.BACKGROUND,
          });

        pageDetailValue[PageDetailValueType.IMAGE_BACKGROUND] =
          await this.pageDetailValueRepo.findOne({
            page_detail_id,
            detail_type: PageDetailValueType.IMAGE_BACKGROUND,
          });

        pageDetailValue[PageDetailValueType.COLOR_BACKGROUND] =
          await this.pageDetailValueRepo.findOne({
            page_detail_id,
            detail_type: PageDetailValueType.COLOR_BACKGROUND,
          });
        currentPageDetail['page_detail_values'] = { ...pageDetailValue };
        break;

      case PageDetailType.BANNER:
        let bannerId = currentPageDetail.page_detail_data;

        if (bannerId) {
          const banner = await this.bannerService.FEgetById(bannerId);
          currentPageDetail['page_detail_values'] = banner;
        }
        break;
      case PageDetailType.FLASH_SALE:
        const flashSale = await this.flashSaleService.FEget();
        currentPageDetail['page_detail_values'] = flashSale;
        break;
      case PageDetailType.MENU:
        const menuDetailValue = await this.getMenu(pageDetailValues);
        currentPageDetail['page_detail_values'] = menuDetailValue;
        break;
      default:
        currentPageDetail['page_detail_values'] = pageDetailValues;
    }

    return currentPageDetail['page_detail_values'];
  }

  async getMenu(pageDetailValues) {
    for (let pageDetailValue of pageDetailValues) {
      if (pageDetailValue.detail_type === PageDetailType.BOX_MENU) {
        let resultData = JSON.parse(pageDetailValue.data_value);
        pageDetailValue['data_value'] = { ...resultData };
        if (resultData['LIST_PRODUCT'] && resultData['LIST_PRODUCT'].length) {
          let productDetails = [];
          for (let { product_id } of resultData['LIST_PRODUCT']) {
            let product = await this.productRepo.findOne({
              select: getProductsListSelectorBE,
              join: productLeftJoiner,
              where: { [`${Table.PRODUCTS}.product_id`]: product_id },
            });
            productDetails = [...productDetails, product];
          }
          resultData['LIST_PRODUCT'] = productDetails;
        }
        pageDetailValue['data_value'] = resultData;
      }
    }
    return pageDetailValues;
  }

  async createPageDetailItem(data: CreatePageDetailItemDto) {
    let result;
    console.log(data);
    if (data.page_detail_id) {
      const pageDetailData = this.pageDetailRepo.setData(data);
      result = await this.pageDetailRepo.update(
        { page_detail_id: data.page_detail_id },
        pageDetailData,
        true,
      );
    } else {
      if (!data.page_id) {
        throw new HttpException('Cần trang chi tiết để tạo value', 400);
      }
      const pageDetailData = {
        ...new PageDetailEntity(),
        ...this.pageDetailRepo.setData(data),
      };

      result = await this.pageDetailRepo.create(pageDetailData);
    }
    return this.getPageDetailItem(result.page_detail_id);
  }

  async getPageDetailItem(page_detail_id) {
    const result = await this.pageDetailRepo.findOne({ page_detail_id });
    if (!result) {
      throw new HttpException('Không tìm thấy.', 404);
    }
    return result;
  }

  async FEGetPage(link_url) {
    const currentPage = await this.pageRepo.findOne({ link_url });
    if (!currentPage) {
      throw new HttpException('Không tìm thấy trang.', 404);
    }

    if (currentPage.status !== 'A') {
      throw new HttpException('Trang đã bị khoá.', 409);
    }

    let pageCacheResult = await this.cache.getCachePageById(
      currentPage.page_id,
    );

    if (pageCacheResult) {
      return pageCacheResult;
    }

    currentPage['page_data'] = isJsonString(currentPage['page_data'])
      ? JSON.parse(currentPage['page_data'])
      : currentPage['page_data'];

    const pageDetails = await this.pageDetailRepo.find({
      select: '*',
      orderBy: [
        {
          field: `CASE WHEN ${Table.PAGE_DETAIL}.position`,
          sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.PAGE_DETAIL}.position ASC`,
        },
      ],
      where: {
        [`${Table.PAGE_DETAIL}.page_id`]: currentPage.page_id,
        [`${Table.PAGE_DETAIL}.status`]: 'A',
      },
    });

    for (let pageDetail of pageDetails) {
      let pageDetailWithValues = await this.FEgetPageDetailValues(
        pageDetail.page_detail_id,
      );
      pageDetail['page_detail_values'] = pageDetailWithValues;
    }

    currentPage['page_details'] = pageDetails;

    await this.cache.setCachePageById(currentPage.page_id, currentPage);

    return currentPage;
  }

  async FEgetPagesList(params: any = {}) {
    let { link_url } = params;
    if (link_url) {
      return this.FEGetPage(link_url);
    }
    return this.pageRepo.find();
  }

  async createOrUpdatePageDetailItem(data: CreateOrUpdatePageDetailDto) {
    if (data.page_detail_id) {
      let pageDetail = await this.pageDetailRepo.findOne({
        page_detail_id: data.page_detail_id,
      });
      if (!pageDetail) {
        throw new HttpException('Không tìm thấy trang chi tiết', 404);
      }

      await this.cache.removeCachePageById(pageDetail.page_id);

      let pageDetails = await this.pageDetailRepo.find({
        page_id: data.page_id,
      });
      if (
        pageDetails.length &&
        data.module_name &&
        pageDetails.some(
          ({ module_name, page_detail_id }) =>
            module_name.toLowerCase().trim() ==
              removeMoreThanOneSpace(data.module_name).toLowerCase().trim() &&
            data.page_detail_id === page_detail_id,
        )
      ) {
        throw new HttpException('Tên Module trong trang đã tồn tại', 409);
      }

      const pageDetailData = this.pageDetailRepo.setData(data);
      if (data.module_name) {
        pageDetailData['module_name'] = removeMoreThanOneSpace(
          data.module_name,
        );
      }
      if (Object.entries(pageDetailData).length) {
        await this.pageDetailRepo.update(
          { page_detail_id: data.page_detail_id },
          pageDetailData,
        );
      }

      if (data.page_detail_values && data.page_detail_values.length) {
        let oldPageDetailValues = await this.pageDetailValueRepo.delete({
          page_detail_id: data.page_detail_id,
        });
        for (let pageDetailValue of data.page_detail_values) {
          let pageDetailValueData = {
            ...new PageDetailValueEntity(),
            ...this.pageDetailValueRepo.setData(pageDetailValue),
            page_detail_id: data.page_detail_id,
          };
          await this.pageDetailValueRepo.create(pageDetailValueData, false);
        }
      }
    } else {
      if (!data.module_name) {
        throw new HttpException('Cần nhập tên module', 400);
      }

      if (!data.page_id) {
        throw new HttpException('Cần truyền page_id', 400);
      }

      await this.cache.removeCachePageById(data.page_id);

      let pageDetails = await this.pageDetailRepo.find({
        page_id: data.page_id,
      });

      if (
        pageDetails.length &&
        pageDetails.some(
          ({ module_name }) =>
            module_name.toLowerCase().trim() ==
            removeMoreThanOneSpace(data.module_name).toLowerCase().trim(),
        )
      ) {
        throw new HttpException('Tên Module trong trang đã tồn tại', 409);
      }

      let pageDetailData = {
        ...new PageDetailEntity(),
        ...this.pageDetailRepo.setData(data),
      };
      const newPageDetail = await this.pageDetailRepo.create(pageDetailData);

      if (data.page_detail_values && data.page_detail_values.length) {
        for (let pageDetailValue of data.page_detail_values) {
          let pageDetailValueData = {
            ...new PageDetailValueEntity(),
            ...this.pageDetailValueRepo.setData(pageDetailValue),
            page_detail_id: newPageDetail.page_detail_id,
          };
          await this.pageDetailValueRepo.create(pageDetailValueData, false);
        }
      }
    }
  }

  async updatePageDetailsPosition(data: UpdatePageDetailsPosition) {
    if (data.page_details && data.page_details.length) {
      let pageDetail = await this.pageDetailRepo.findOne({
        page_detail_id: data.page_details[0].page_detail_id,
      });
      if (pageDetail) {
        await this.cache.removeCachePageById(pageDetail.page_id);
      }
      for (let pageDetailItem of data.page_details) {
        let pageDetailItemData = this.pageDetailRepo.setData(pageDetailItem);
        await this.pageDetailRepo.update(
          { page_detail_id: pageDetailItem.page_detail_id },
          {
            ...pageDetailItemData,
            page_detail_id: pageDetailItem.page_detail_id,
          },
        );
      }
    }
  }

  async getPageInfo(page_id: number) {
    const currentPage = await this.pageRepo.findOne({ page_id });
    if (!currentPage) {
      throw new HttpException('Không tìm thấy trang.', 404);
    }

    let pageDetails = await this.pageDetailRepo.find({
      orderBy: [{ field: `${Table.PAGE_DETAIL}.position`, sortBy: SortBy.ASC }],
      where: { page_id },
    });

    currentPage['page_details'] = pageDetails;
    return currentPage;
  }

  async getPageDetailInfo(page_detail_id: number) {
    let currentPageDetail = await this.pageDetailRepo.findOne({
      select: `${Table.PAGE}.page_id, ${Table.PAGE}.page_name, ${Table.PAGE_DETAIL}.*`,
      join: pageProgramDetailJoiner,
      where: { [`${Table.PAGE_DETAIL}.page_detail_id`]: page_detail_id },
    });

    if (!currentPageDetail) {
      throw new HttpException('Không tìm thấy chi tiết trang', 404);
    }

    let pageDetailValues = await this.pageDetailValueRepo.find({
      select: `${Table.PAGE}.page_id, ${Table.PAGE_DETAIL}.page_detail_id, ${Table.PAGE_DETAIL_VALUE}.*`,
      join: pageDetailValueJoiner,
      where: { [`${Table.PAGE_DETAIL_VALUE}.page_detail_id`]: page_detail_id },
      orderBy: [
        { field: `${Table.PAGE_DETAIL_VALUE}.position`, sortBy: SortBy.ASC },
      ],
    });

    if (currentPageDetail.detail_type == PageDetailType.BOX_PRODUCT) {
      currentPageDetail['page_detail_values'] = {};
      for (let detailValue of pageDetailValues) {
        if (detailValue.detail_type == 'LIST_PRODUCTS') {
          let product = await this.productRepo.findOne({
            select: getProductsListSelectorBE,
            join: productLeftJoiner,
            where: { [`${Table.PRODUCTS}.product_id`]: detailValue.data_value },
          });

          detailValue = {
            ...detailValue,
            ...product,
          };
        }

        currentPageDetail['page_detail_values'][detailValue.detail_type] =
          currentPageDetail['page_detail_values'][detailValue.detail_type]
            ? [
                ...currentPageDetail['page_detail_values'][
                  detailValue.detail_type
                ],
                detailValue,
              ]
            : [detailValue];
      }
    } else {
      currentPageDetail['page_detail_values'] = pageDetailValues;
    }

    return currentPageDetail;
  }

  async createOrUpdatePageDetailValueItem(
    data: CreateOrUpdatePageDetailValueItemDto,
  ) {
    if (data.value_id) {
      const currentPageDetailValue = await this.pageDetailValueRepo.findOne({
        page_detail_id: data.page_detail_id,
        value_id: data.value_id,
      });
      if (!currentPageDetailValue) {
        throw new HttpException('Không tìm thấy trang chi tiết', 404);
      }

      const currentPageDetail = await this.pageDetailRepo.findOne({
        page_detail_id: currentPageDetailValue.page_detail_id,
      });
      if (currentPageDetail) {
        await this.cache.removeCachePageById(currentPageDetail.page_id);
      }

      let pageDetailValues = await this.pageDetailValueRepo.find({
        where: { page_detail_id: data.page_detail_id },
        orderBy: [
          { field: `${Table.PAGE_DETAIL_VALUE}.position`, sortBy: SortBy.ASC },
        ],
      });

      if (
        data.page_detail_name &&
        pageDetailValues.some(
          ({ page_detail_name }) =>
            page_detail_name.toLowerCase().trim() ===
              removeMoreThanOneSpace(data.page_detail_name)
                .toLowerCase()
                .trim() && data.value_id !== data.value_id,
        )
      ) {
        throw new HttpException(
          'Tên module trong Chi tiết trang đã tồn tại',
          400,
        );
      }
      const pageDetailValueData = this.pageDetailValueRepo.setData(data);
      if (Object.entries(pageDetailValueData).length) {
        await this.pageDetailValueRepo.update(
          { value_id: data.value_id },
          pageDetailValueData,
        );
      }
    } else {
      if (!data.page_detail_id) {
        throw new HttpException('Trang chi tiết là bắt buộc', 400);
      }
      const currentPageDetail = await this.pageDetailRepo.findOne({
        page_detail_id: data.page_detail_id,
      });
      if (currentPageDetail) {
        await this.cache.removeCachePageById(currentPageDetail.page_id);
      }

      let pageDetailValues = await this.pageDetailValueRepo.find({
        page_detail_id: data.page_detail_id,
      });
      if (
        data.page_detail_name &&
        pageDetailValues.some(
          ({ page_detail_name }) =>
            page_detail_name.toLowerCase().trim() ===
            removeMoreThanOneSpace(data.page_detail_name).toLowerCase().trim(),
        )
      ) {
        throw new HttpException(
          'Tên module trong Chi tiết trang đã tồn tại',
          400,
        );
      }

      const newPageDetailValue = {
        ...new PageDetailValueEntity(),
        ...this.pageDetailValueRepo.setData(data),
      };
      await this.pageDetailValueRepo.create(newPageDetailValue);
    }
  }

  async updatePageDetailValuePosition(data: UpdatePageDetailValuesPositionDto) {
    if (data.page_detail_values && data.page_detail_values.length) {
      let firstPageDetailValue = await this.pageDetailValueRepo.findOne({
        value_id: data.page_detail_values[0].value_id,
      });
      if (firstPageDetailValue) {
        let pageDetail = await this.pageDetailRepo.findOne({
          page_detail_id: firstPageDetailValue.page_detail_id,
        });
        if (pageDetail) {
          await this.cache.removeCachePageById(pageDetail.page_id);
        }
      }
      for (let pageDetailValue of data.page_detail_values) {
        let pageDetailValueData =
          this.pageDetailValueRepo.setData(pageDetailValue);
        await this.pageDetailValueRepo.update(
          { value_id: pageDetailValue.value_id },
          { ...pageDetailValueData, value_id: pageDetailValue.value_id },
        );
      }
    }
  }

  async getPageDetailValueInfo(value_id) {
    let result = await this.pageDetailValueRepo.findOne({
      select: `${Table.PAGE}.page_id, ${Table.PAGE}.page_name, ${Table.PAGE_DETAIL}.module_name, ${Table.PAGE_DETAIL_VALUE}.*`,
      join: pageProgramDetailValueJoiner,
      where: { [`${Table.PAGE_DETAIL_VALUE}.value_id`]: value_id },
    });

    if (result.detail_type === PageDetailType.BOX_MENU) {
      let resultData = JSON.parse(result.data_value);
      result['data_value'] = { ...resultData };
      if (resultData['LIST_PRODUCT'] && resultData['LIST_PRODUCT'].length) {
        let productDetails = [];
        for (let { product_id } of resultData['LIST_PRODUCT']) {
          let product = await this.productRepo.findOne({
            select: getProductsListSelectorBE,
            join: productLeftJoiner,
            where: { [`${Table.PRODUCTS}.product_id`]: product_id },
          });
          productDetails = [...productDetails, product];
        }
        resultData['LIST_PRODUCT'] = productDetails;
      }

      result['data_value'] = resultData;
    }

    return result;
  }
}
