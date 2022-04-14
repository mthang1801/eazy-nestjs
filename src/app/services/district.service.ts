import { Injectable } from '@nestjs/common';
import { DistrictRepository } from '../repositories/district.repository';
import { DistrictEntity } from '../entities/districts.entity';
import { Table } from 'src/database/enums';
import { districtSearchFilter } from '../../database/sqlQuery/where/district.where';
@Injectable()
export class DistrictService {
  constructor(private districtRepo: DistrictRepository<DistrictEntity>) {}

  async getList(params) {
    const { q, city_id } = params;
    let filterCondition = {};
    if (city_id) {
      filterCondition[`${Table.DISTRICTS}.city_id`] = city_id;
    }
    const count = await this.districtRepo.find({
      select: 'COUNT(id) as total',
      where: districtSearchFilter(q, filterCondition),
    });

    const districts = await this.districtRepo.find({
      select: '*',
      where: districtSearchFilter(q, filterCondition),
    });

    return {
      count: count[0].total,
      districts,
    };
  }

  async get(id, onlyName = false) {
    const result = await this.districtRepo.findOne({ id });
    if (onlyName && result) {
      return result['district_name'];
    }
    return result;
  }
}
