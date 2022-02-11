import { ICategory } from './category.interface';
import { ICategoryDescription } from './categoryDescription.interface';

export interface ICategoryResult extends ICategory, ICategoryDescription {
  children?: ICategoryResult[];
}
