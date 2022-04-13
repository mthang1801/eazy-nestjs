import { searchFilterTemplate } from './template.where';
import { Like } from '../../operators/operators';
import { Table } from 'src/database/enums';
export const citiesSearch = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.CITIES}.city_name`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};
