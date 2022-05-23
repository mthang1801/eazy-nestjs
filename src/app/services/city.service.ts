import { Injectable } from '@nestjs/common';
import { CityEntity } from '../entities/cities.entity';
import { CityRepository } from '../repositories/city.repository';
import { citiesSearch } from '../../database/sqlQuery/where/city.where';

@Injectable()
export class CityService {
  constructor(private cityRepo: CityRepository<CityEntity>) {}

  async getList(params) {
    const { q } = params;

    let count = await this.cityRepo.find({
      select: 'COUNT(id) as total',
      where: citiesSearch(q),
    });
    let cities = await this.cityRepo.find({
      select: '*',
      where: citiesSearch(q),
    });

    return {
      count: count[0].total,
      cities,
    };
  }

  async get(id: number, onlyName = false) {
    const result = await this.cityRepo.findOne({ id });

    if (onlyName && result) {
      return result['city_name'];
    }
    return result;
  }
}
