import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { Table } from '../../database/enums/tables.enum';
import { convertToMySQLDateTime, convertToSlug } from '../../utils/helper';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import { CategoryDescriptionEntity } from '../entities/categoryDescription.entity';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryDescriptionRepository } from '../repositories/categoryDescriptions.repository';
import * as _ from 'lodash';
import { Like } from '../../database/find-options/operators';
import { ICategoryResult } from '../interfaces/categoryReult.interface';

@Injectable()
export class CategoryService {
  constructor(
    private categoryDescriptionRepo: CategoryDescriptionRepository<CategoryDescriptionEntity>,
    private categoryRepository: CategoryRepository<CategoryEntity>,
  ) {}

  async create(data: CreateCategoryDto): Promise</*ICategoryResult*/ any> {
    const categoryData = this.categoryRepository.setData(data);
    if (data.level > 1 && !data.parent_id) {
      throw new HttpException('Level lớn hơn 1 cần có parent_id', 400);
    }

    let idPath = '';

    if (data.level === 2) {
      idPath = `${data.parent_id}`;
    }
    if (data.level === 3 && data.parent_id) {
      let parentCategory = await this.categoryRepository.findById(
        data.parent_id,
      );
      let grandParentCategory = await this.categoryRepository.findById(
        parentCategory.parent_id,
      );
      idPath = `${grandParentCategory.category_id}/${parentCategory.category_id}`;
    }

    const checkSlugExist = await this.categoryRepository.findOne({
      slug: convertToSlug(data.slug),
    });

    if (checkSlugExist) {
      throw new HttpException('Đường dẫn đã tồn tại.', 409);
    }

    let parentLevel;
    if (data.parent_id > 0) {
      parentLevel = await this.categoryRepository.findById(data.parent_id);

      if (!parentLevel) {
        throw new HttpException('Không tìm thấy danh mục cha.', 404);
      }
    }

    const createdCategory: CategoryEntity =
      await this.categoryRepository.create({
        ...categoryData,
        id_path: idPath,
        slug: convertToSlug(data.slug),
        level: data.parent_id ? parentLevel.level + 1 : 1,
        display_at: convertToMySQLDateTime(
          categoryData['display_at']
            ? new Date(categoryData['display_at'])
            : new Date(),
        ),
        created_at: convertToMySQLDateTime(),
      });

    const categoryDescriptionData = this.categoryDescriptionRepo.setData(data);

    const createdCategoryDescription: CategoryDescriptionEntity =
      await this.categoryDescriptionRepo.create({
        category_id: createdCategory.category_id,
        ...categoryDescriptionData,
      });

    // Update product count from current category to root category
    await this.updateCategoryProductCount(createdCategory);

    // Add category_id to product, working with ddv_products_categories table

    return { ...createdCategory, ...createdCategoryDescription };
  }

  //Using recursion to update product count for category by parent_id
  async updateCategoryProductCount(
    currentCategory: CategoryEntity,
    product_count: number = currentCategory.product_count,
  ): Promise<void> {
    if (currentCategory.level === 1) return;

    const parentCategory: CategoryEntity =
      await this.categoryRepository.findById(currentCategory.parent_id);

    if (!parentCategory) return;

    const parentProductCount = parentCategory.product_count + product_count;

    await this.categoryRepository.update(parentCategory.category_id, {
      product_count: parentProductCount,
    });

    await this.updateCategoryProductCount(parentCategory, product_count);
  }

  async update(id: number, data: UpdateCategoryDto): Promise<ICategoryResult> {
    const oldCategoryData: CategoryEntity =
      await this.categoryRepository.findOne({
        category_id: id,
      });

    if (!oldCategoryData) {
      throw new HttpException(
        `Không tìm thấy category với id là ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (data.slug && data.slug !== oldCategoryData.slug) {
      const checkSlug = await this.categoryRepository.findOne({
        slug: convertToSlug(data.slug),
      });
      if (checkSlug) {
        throw new HttpException('Slug đã tồn tại, không thể cập nhật.', 409);
      }
    }
    let updatedCategoryDataObject = {};

    for (let [key, val] of Object.entries(data)) {
      if (this.categoryRepository.tableProps.includes(key)) {
        if (key === 'display_at') {
          updatedCategoryDataObject['display_at'] = convertToMySQLDateTime(
            new Date(val),
          );
          continue;
        }
        if (key === 'slug') {
          console.log(143, key, val);
          updatedCategoryDataObject['slug'] = convertToSlug(val);
          continue;
        }
        updatedCategoryDataObject[key] = val;
      }
    }

    const updatedCategoryData = await this.categoryRepository.update(
      oldCategoryData.category_id,
      {
        ...updatedCategoryDataObject,
      },
    );

    const oldCategoryDescription = await this.categoryDescriptionRepo.findOne({
      category_id: id,
    });

    if (!oldCategoryDescription) {
      throw new HttpException(
        `Không tìm thấy category description với id là ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    let updatedCategoryDescriptionDataObject = {};
    for (let [key, val] of Object.entries(data)) {
      if (this.categoryDescriptionRepo.tableProps.includes(key)) {
        updatedCategoryDescriptionDataObject[key] = val;
      }
    }

    if (Object.entries(updatedCategoryDescriptionDataObject).length) {
      const updatedCategoryDescription =
        await this.categoryDescriptionRepo.update(
          oldCategoryDescription.category_description_id,
          {
            ...updatedCategoryDescriptionDataObject,
          },
        );
      return { ...updatedCategoryData, ...updatedCategoryDescription };
    }

    const categoryDescription = await this.categoryDescriptionRepo.findOne({
      category_id: id,
    });

    const diffProductCount = data.product_count - oldCategoryData.product_count;

    if (diffProductCount) {
      await this.updateCategoryProductCount(
        updatedCategoryData,
        diffProductCount,
      );
    }

    return { ...updatedCategoryData, ...categoryDescription };
  }

  async getList(params): Promise<ICategoryResult[]> {
    // ignore page and limit
    let { page, limit, ...others } = params;
    let filterCondition = {};

    for (let [key, val] of Object.entries(others)) {
      if (this.categoryRepository.tableProps.includes(key)) {
        filterCondition[`${Table.CATEGORIES}.${key}`] = Like(val);
      } else {
        filterCondition[`${Table.CATEGORY_DESCRIPTIONS}.${key}`] = Like(val);
      }
    }

    const categoriesListLevel1 = await this.categoryRepository.find({
      select: [`*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
            rootJoin: `${Table.CATEGORIES}.category_id`,
          },
        },
      },
      where: { [`${Table.CATEGORIES}.level`]: 1 },
    });

    for (let categoryLevel1Item of categoriesListLevel1) {
      let categoriesListLevel2 = await this.categoryRepository.find({
        select: [`*`],
        join: {
          [JoinTable.leftJoin]: {
            [Table.CATEGORY_DESCRIPTIONS]: {
              fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
          },
        },
        where: {
          [`${Table.CATEGORIES}.level`]: 2,
          parent_id: categoryLevel1Item.category_id,
        },
      });

      for (let categoryLevel2Item of categoriesListLevel2) {
        let categoriesListLevel3 = await this.categoryRepository.find({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.CATEGORY_DESCRIPTIONS]: {
                fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
                rootJoin: `${Table.CATEGORIES}.category_id`,
              },
            },
          },
          where: {
            [`${Table.CATEGORIES}.level`]: 3,
            parent_id: categoryLevel2Item.category_id,
          },
        });

        categoryLevel2Item.children = categoriesListLevel3;
      }

      categoryLevel1Item.children = categoriesListLevel2;
    }

    return categoriesListLevel1;
  }

  async get(id: number): Promise<ICategoryResult> {
    let category = await this.categoryRepository.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
            rootJoin: `${Table.CATEGORIES}.category_id`,
          },
        },
      },
      where: { [`${Table.CATEGORIES}.category_id`]: id },
    });

    // If level 1, find all its children
    if (category.level === 1) {
      const children = await this.categoryRepository.find({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.CATEGORY_DESCRIPTIONS]: {
              fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
          },
        },
        where: { [`${Table.CATEGORIES}.parent_id`]: id },
      });
      category['children'] = children;
    }

    return category;
  }

  async delete(id: number): Promise<boolean> {
    const deleteStatus = await this.categoryRepository.delete({
      category_id: id,
    });

    await this.categoryDescriptionRepo.delete({ category_id: id });

    return deleteStatus;
  }
}
