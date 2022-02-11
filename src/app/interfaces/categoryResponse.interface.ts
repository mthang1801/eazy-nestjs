import { ICategory } from './category.interface';
import { ICategoryDescription } from './categoryDescription.interface';

export interface ICategoryResponse extends ICategory, ICategoryDescription {
  children?: ICategoryResponse[];
}
