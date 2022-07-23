import { SortType } from '../enums/sortBy.enum';
export interface ISortQuery {
  sortBy: string;
  sortType: SortType;
}
