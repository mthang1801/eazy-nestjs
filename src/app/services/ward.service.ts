import { Injectable } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { WardEntity } from '../entities/wards.entity';
import { WardRepository } from '../repositories/ward.repository';
import { wardSearchFilter } from '../../database/sqlQuery/where/ward.where';

@Injectable()
export class WardService {
  constructor(private wardRepo: WardRepository<WardEntity>) {}
  async getList(params) {
    const { q, district_id } = params;
    let filterCondition = {};
    if (district_id) {
      filterCondition[`${Table.WARDS}.district_id`] = district_id;
    }
    const count = await this.wardRepo.find({
      select: 'COUNT(id) as total',
      where: wardSearchFilter(q, filterCondition),
    });
    const wards = await this.wardRepo.find(
      wardSearchFilter(q, filterCondition),
    );

    return {
      count: count[0].total,
      wards,
    };
  }

  async get(id, onlyName = false) {
    const result = await this.wardRepo.findOne({ id });
    if (onlyName && result) {
      return result['ward_name'];
    }
    return result;
  }
}
