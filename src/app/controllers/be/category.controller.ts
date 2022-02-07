import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Put,
  UseGuards,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { CategoryService } from '../../services/category.service';
import { AuthGuard } from '../../../middlewares/be.auth';
import { CreateCategoryDto } from '../../dto/category/create-category.dto';
import { IResponse } from '../../interfaces/response.interface';
import { Response } from 'express';
import { UpdateCategoryDto } from '../../dto/category/update-category.dto';

/**
 * Controller for Category
 * @Author MvThang
 */
@Controller('/be/v1/category')
export class CategoryController extends BaseController {
  constructor(private categoryService: CategoryService) {
    super();
  }

  /**
   * Create new record in ddv_categories table
   * @param categoryDto
   * @param res
   * @returns
   */
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() categoryDto: CreateCategoryDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const createdCategory = await this.categoryService.Create(categoryDto);
    return this.responseSuccess(res, createdCategory);
  }

  /**
   * Fetch list categories in ddv_categories table
   * @param skip number
   * @param limit number
   * @param res categories[]
   * @returns
   */
  @Get()
  async fetchListCategoryMenu(@Res() res: Response): Promise<IResponse> {
    const categoriesMenuList =
      await this.categoryService.fetchListCategoryMenu();
    return this.responseSuccess(res, categoriesMenuList);
  }

  /**
   * Update records by category_id in ddv_categories table
   * @param categoryDto
   * @param id
   * @param res
   * @returns
   */
  @Put('/:id')
  @UseGuards(AuthGuard)
  async update(
    @Body() categoryDto: UpdateCategoryDto,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const updatedCategory = await this.categoryService.Update(id, categoryDto);
    return this.responseSuccess(res, updatedCategory);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<IResponse> {
    const boolRes = await this.categoryService.Delete(id);
    return boolRes
      ? this.respondNoContent(res)
      : this.respondNotFound(
          res,
          `Xoá không thành công, không tìm thấy id ${id}.`,
        );
  }
}
