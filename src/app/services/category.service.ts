import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BaseService } from '../../base/base.service';

import { CategoryRepository } from '../repositories/category.repository';
import { Table } from '../../database/enums/tables.enum';

import { convertToMySQLDateTime } from '../../utils/helper';
import {
  CreateCategoryDto,
  CreateCategoryVendorProductCountDto,
  CategoryDescriptionDto,
} from '../dto/category/create-category.dto';

import { SortBy } from '../../database/enums/sortBy.enum';
import { PrimaryKeys } from '../../database/enums/primary-keys.enum';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import {
  UpdateCategoryDescriptionDto,
  UpdateCategoryVendorProductCountDto,
} from '../dto/category/update-category.dto';
import { CategoryDescriptionEntity } from '../entities/category-description.entity';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryVendorProductCountEntity } from '../entities/category-vendor-product-count.entity';
import { Like } from '../../database/find-options/operators';
import { CategoryDescriptionRepository } from '../repositories/category_descriptions.repository';
import { CategoryVendorProductCountRepository } from '../repositories/category_vendor_product_count.repository';

@Injectable()
export class CategoryService {
  private categoriesTable: Table = Table.CATEGORIES;
  constructor(
    private categoryDescriptionRepo: CategoryDescriptionRepository<CategoryDescriptionEntity>,
    private categoryRepository: CategoryRepository<CategoryEntity>,
    private categoryVendorProductCountRepo: CategoryVendorProductCountRepository<CategoryVendorProductCountEntity>,
  ) {}

  async Create(data: CreateCategoryDto): Promise<any> {
    const {
      id_path,
      level,
      company_id,
      usergroup_ids,
      status,
      product_count,
      position,
      is_op,
      localization,
      age_verification,
      age_limit,
      parent_age_verification,
      parent_age_limit,
      selected_views,
      default_view,
      product_details_view,
      product_columns,
      is_trash,
      category_type,
      lang_code,
      category,
      description,
      meta_keywords,
      meta_description,
      page_title,
      age_warning_message,
    } = data;

    const createdCategory: CategoryEntity =
      await this.categoryRepository.create({
        id_path,
        level,
        company_id,
        usergroup_ids,
        status,
        product_count,
        position,
        is_op,
        localization,
        age_verification,
        age_limit,
        parent_age_verification,
        parent_age_limit,
        selected_views,
        default_view,
        product_details_view,
        product_columns,
        is_trash,
        category_type,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });

    const createdCategoryDescription: CategoryDescriptionEntity =
      await this.categoryDescriptionRepo.create({
        category_id: createdCategory.category_id,
        lang_code,
        category,
        description,
        meta_keywords,
        meta_description,
        page_title,
        age_warning_message,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });

    return { ...createdCategory, ...createdCategoryDescription };
  }

  async Update(id: number, data: UpdateCategoryDto): Promise<any> {
    const {
      id_path,
      level,
      company_id,
      usergroup_ids,
      status,
      product_count,
      position,
      is_op,
      localization,
      age_verification,
      age_limit,
      parent_age_verification,
      parent_age_limit,
      selected_views,
      default_view,
      product_details_view,
      product_columns,
      is_trash,
      category_type,
      lang_code,
      category,
      description,
      meta_keywords,
      meta_description,
      page_title,
      age_warning_message,
    } = data;
    const oldCategoryData = await this.categoryRepository.findOne({
      category_id: id,
    });
    const updatedCategoryData = await this.categoryRepository.update(
      oldCategoryData.category_id,
      {
        ...oldCategoryData,
        id_path: id_path || oldCategoryData.id_path,
        level: level || oldCategoryData.level,
        company_id: company_id || oldCategoryData.company_id,
        usergroup_ids: usergroup_ids || oldCategoryData.usergroup_ids,
        status: status || oldCategoryData.status,
        product_count: product_count || oldCategoryData.product_count,
        position: position || oldCategoryData.position,
        is_op: is_op || oldCategoryData.is_op,
        localization: localization || oldCategoryData.localization,
        age_verification: age_verification || oldCategoryData.age_verification,
        age_limit: age_limit || oldCategoryData.age_limit,
        parent_age_verification:
          parent_age_verification || oldCategoryData.parent_age_verification,
        parent_age_limit: parent_age_limit || oldCategoryData.parent_age_limit,
        selected_views: selected_views || oldCategoryData.selected_views,
        default_view: default_view || oldCategoryData.default_view,
        product_details_view:
          product_details_view || oldCategoryData.product_details_view,
        product_columns: product_columns || oldCategoryData.product_columns,
        is_trash: is_trash || oldCategoryData.is_trash,
        category_type: category_type || oldCategoryData.category_type,
        updated_at: convertToMySQLDateTime(),
      },
    );

    const oldCategoryDescription = await this.categoryDescriptionRepo.findOne({
      category_id: id,
    });

    const updatedCategoryDescription =
      await this.categoryDescriptionRepo.update(
        oldCategoryDescription.category_description_id,
        {
          lang_code: lang_code || oldCategoryDescription.lang_code,
          category: category || oldCategoryDescription.category,
          description: description || oldCategoryDescription.description,
          meta_keywords: meta_keywords || oldCategoryDescription.meta_keywords,
          meta_description:
            meta_description || oldCategoryDescription.meta_description,
          page_title: page_title || oldCategoryDescription.page_title,
          age_warning_message:
            age_warning_message || oldCategoryDescription.age_warning_message,
          updated_at: convertToMySQLDateTime(),
        },
      );
    return { ...updatedCategoryData, ...updatedCategoryDescription };
  }

  async CreateDescription(
    category_id: number,
    data: CategoryDescriptionDto,
  ): Promise<any> {
    const {
      lang_code,
      category,
      description,
      meta_keywords,
      meta_description,
      page_title,
      age_warning_message,
    } = data;
    console.log(category_id, lang_code);
    const checkDescriptionLangcode = await this.categoryDescriptionRepo.findOne(
      { category_id, lang_code },
    );

    if (checkDescriptionLangcode) {
      const updatedDescriptionLangcode =
        await this.categoryDescriptionRepo.update(
          checkDescriptionLangcode.category_description_id,
          {
            lang_code: lang_code || checkDescriptionLangcode.lang_code,
            category: category || checkDescriptionLangcode.category,
            description: description || checkDescriptionLangcode.description,
            meta_keywords:
              meta_keywords || checkDescriptionLangcode.meta_keywords,
            meta_description:
              meta_description || checkDescriptionLangcode.meta_description,
            page_title: page_title || checkDescriptionLangcode.page_title,
            age_warning_message:
              age_warning_message ||
              checkDescriptionLangcode.age_warning_message,
            updated_at: convertToMySQLDateTime(),
          },
        );
      return updatedDescriptionLangcode;
    }
    return await this.categoryDescriptionRepo.create({
      category_id: category_id,
      lang_code,
      category,
      description,
      meta_keywords,
      meta_description,
      page_title,
      age_warning_message,
      created_at: convertToMySQLDateTime(),
      updated_at: convertToMySQLDateTime(),
    });
  }

  async fetchList(query): Promise<any> {
    let { page, limit, ...others } = query;
    page = +page || 0;
    limit = +limit || 20;
    let offset = (page - 1) * limit;

    let queryFilters = {};
    const categoryDescriptionProps = [
      'lang_code',
      'category',
      'description',
      'meta_keywords',
      'meta_description',
      'page_title',
      'age_warning_message',
    ];
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (categoryDescriptionProps.includes(key)) {
          queryFilters[`${Table.CATEGORY_DESCRIPTIONS}.${key}`] = Like(val);
        } else {
          queryFilters[`${Table.CATEGORIES}.${key}`] = Like(val);
        }
      }
    }

    const list = await this.categoryDescriptionRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORIES]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
          },
        },
      },
      where: queryFilters,
      skip: offset,
      limit,
    });

    return list;
  }

  async Delete(id: number): Promise<boolean> {
    const deleteStatus = await this.categoryRepository.delete({
      category_id: id,
    });
    await this.categoryDescriptionRepo.delete({ category_id: id });
    return deleteStatus;
  }
}
