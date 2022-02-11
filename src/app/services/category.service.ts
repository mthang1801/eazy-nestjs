import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { Table } from '../../database/enums/tables.enum';
import { convertToMySQLDateTime } from '../../utils/helper';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import { CategoryDescriptionEntity } from '../entities/categoryDescription.entity';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryDescriptionRepository } from '../repositories/categoryDescriptions.repository';
import * as _ from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { Like } from '../../database/find-options/operators';
import { ICategoryResult } from '../interfaces/categoryReult.interface';

@Injectable()
export class CategoryService {
  constructor(
    private categoryDescriptionRepo: CategoryDescriptionRepository<CategoryDescriptionEntity>,
    private categoryRepository: CategoryRepository<CategoryEntity>,
  ) {}

  async create(data: CreateCategoryDto): Promise<ICategoryResult> {
    const categoryData = this.categoryRepository.setData(data);
    const createdCategory: CategoryEntity =
      await this.categoryRepository.create({
        ...categoryData,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });
    const categoryDescriptionData = this.categoryDescriptionRepo.setData(data);
    const createdCategoryDescription: CategoryDescriptionEntity =
      await this.categoryDescriptionRepo.create({
        category_id: createdCategory.category_id,
        ...categoryDescriptionData,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });

    return { ...createdCategory, ...createdCategoryDescription };
  }

  async update(id: number, data: UpdateCategoryDto): Promise<ICategoryResult> {
    const oldCategoryData = await this.categoryRepository.findOne({
      category_id: id,
    });

    if (!oldCategoryData) {
      throw new HttpException(
        `Không tìm thấy category với id là ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    let updatedCategoryDataObject = {};

    for (let [key, val] of Object.entries(data)) {
      if (this.categoryRepository.tableProps.includes(key)) {
        updatedCategoryDataObject[key] = val;
      }
    }

    const updatedCategoryData = await this.categoryRepository.update(
      oldCategoryData.category_id,
      {
        ...updatedCategoryDataObject,
        updated_at: convertToMySQLDateTime(),
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
    const updatedCategoryDescription =
      await this.categoryDescriptionRepo.update(
        oldCategoryDescription.category_description_id,
        {
          ...updatedCategoryDescriptionDataObject,
          updated_at: convertToMySQLDateTime(),
        },
      );
    return { ...updatedCategoryData, ...updatedCategoryDescription };
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

    const categoryMenuRawList = await this.categoryRepository.find({
      select: ['*', `${Table.CATEGORIES}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
            rootJoin: `${Table.CATEGORIES}.category_id`,
          },
        },
      },
      where: filterCondition,
      orderBy: [{ field: `${Table.CATEGORIES}.level`, sort_by: SortBy.ASC }],
    });
    let categoryMenuList = [];
    for (let categoryMenuItem of categoryMenuRawList) {
      if (categoryMenuItem.level === 1) {
        categoryMenuList.push({ ...categoryMenuItem, children: [] });
        continue;
      }
      if (categoryMenuItem.level === 2) {
        categoryMenuList = categoryMenuList.map((_categoryMenuItem) => {
          if (
            _categoryMenuItem.level === 1 &&
            _categoryMenuItem.category_id === categoryMenuItem.parent_id
          ) {
            _categoryMenuItem['children'].push(categoryMenuItem);
          }
          return _categoryMenuItem;
        });
        continue;
      }
    }
    return categoryMenuList;
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
