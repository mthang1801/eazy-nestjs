import { Injectable, HttpException } from '@nestjs/common';
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
import { getPageSkipLimit } from '../../utils/helper';

import { Table } from 'src/database/enums';
import { pagesListSearchFilter } from '../../utils/tableConditioner';
import { IGetPagesFilters } from '../interfaces/pages/getPagesFitlers.interface';
import { sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CreatePageDetailValuesDto } from '../dto/page/create-pageDetailValues.dto';
import { UpdatePageDetailValueDto } from '../dto/page/update-pageDetailValue.dto';
import { CreatePageDetailValueDto } from '../dto/page/create-pageDetailValue.dto';

@Injectable()
export class PageService {
  constructor(
    private pageRepo: PageRepository<PageEntity>,
    private pageDetailRepo: PageDetailRepository<PageDetailEntity>,
    private pageDetailValueRepo: PageDetailValueRepository<PageDetailValueEntity>,
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
              pageDetailValue['name'] = `${
                pageDetailValue['name']
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
              pageDetailValue['name'] = `${
                pageDetailValue['name']
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
                ({ name }) =>
                  name.toLowerCase().trim() ==
                  removeMoreThanOneSpace(pageDetailValue.page_detail_name)
                    .toLowerCase()
                    .trim(),
              )
            ) {
              pageDetailValue['name'] = `${
                pageDetailValue['name']
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
    const pageDetailValues = await this.pageDetailValueRepo.find({
      select: '*',
      orderBy: [
        {
          field: `CASE WHEN ${Table.PAGE_DETAIL_VALUE}.position`,
          sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.PAGE_DETAIL_VALUE}.position ASC`,
        },
      ],
      where: {
        [`${Table.PAGE_DETAIL_VALUE}.page_detail_id`]: page_detail_id,
      },
    });
    return pageDetailValues;
  }
}
