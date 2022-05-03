import { Injectable, HttpException } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { StatusEntity } from '../entities/status.entity';
import { StatusDataEntity } from '../entities/statusData.entity';
import { StatusDescriptionEntity } from '../entities/statusDescription';
import { StatusRepository } from '../repositories/status.repository';
import { StatusDataRepository } from '../repositories/statusData.repository';
import { StatusDescriptionRepository } from '../repositories/statusDescription.repository';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { searchStatusFilter } from 'src/utils/tableConditioner';
import { OrderStatusCreateDTO } from '../dto/orderStatus/create-orderStatus.dto';
import { OrderStatusUpdateDTO } from '../dto/orderStatus/update-orderStatus.dto';
import { formatStandardTimeStamp } from '../../utils/helper';

@Injectable()
export class StatusService {
  constructor(
    private statusRepo: StatusRepository<StatusEntity>,
    private statusDescRepo: StatusDescriptionRepository<StatusDescriptionEntity>,
    private statusDataRepo: StatusDataRepository<StatusDataEntity>,
  ) {}
  async getList(params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.statusRepo.tableProps.includes(key)) {
          filterConditions[`${Table.STATUS}.${key}`] = val;
        }
      }
    }

    const statusesList = await this.statusRepo.find({
      select: '*',
      join: {
        [JoinTable.leftJoin]: {
          [Table.STATUS_DESCRIPTION]: {
            fieldJoin: `${Table.STATUS_DESCRIPTION}.status_id`,
            rootJoin: `${Table.STATUS}.status_id`,
          },
        },
      },
      where: searchStatusFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.statusRepo.find({
      select: `COUNT(DISTINCT(${Table.STATUS}.status_id)) as total`,
      join: {
        [JoinTable.leftJoin]: {
          [Table.STATUS_DESCRIPTION]: {
            fieldJoin: `${Table.STATUS_DESCRIPTION}.status_id`,
            rootJoin: `${Table.STATUS}.status_id`,
          },
        },
      },
      where: searchStatusFilter(search, filterConditions),
    });

    return {
      result: statusesList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : statusesList.length,
      },
    };
  }

  async create(data: OrderStatusCreateDTO) {
    //====Check if exist

    const check = await this.statusRepo.findOne({
      where: { status: data.status, type: data.type },
    });

    if (check && typeof check === 'object' && Object.keys(check).length != 0) {
      throw new HttpException('Status và Type bị trùng', 422);
    }

    const orderStatusData = {
      ...new StatusEntity(),
      ...this.statusDataRepo.setData(data),
    };

    let _orderStatus = await this.statusRepo.create(orderStatusData);

    ///==========================|Add to ddv_status_data table|==============

    const orderStatusDataDes = {
      ...new StatusDescriptionEntity(),
      ...this.statusDataRepo.setData(data),
      status_id: _orderStatus.status_id,
    };

    let _orderStatusDes = await this.statusDescRepo.create(orderStatusDataDes);
    return this.getById(_orderStatus.status_id);
  }

  async getById(id) {
    const status = await this.statusRepo.findOne({ status_id: id });
    if (!status) {
      throw new HttpException('Không tìm thấy trạng thái', 404);
    }
    const statusDesc = await this.statusDescRepo.findOne({ status_id: id });
    return { ...status, ...statusDesc };
  }

  async update(id, data: OrderStatusUpdateDTO) {
    const statusData = {
      ...this.statusRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };
    let status = await this.statusRepo.findOne({ status_id: id });
    if (!status) {
      throw new HttpException('Không tìm thấy trạng thái', 404);
    }
    await this.statusRepo.update({ status_id: id }, statusData);
    const statusDesc = await this.statusDescRepo.findOne({ status_id: id });
    if (statusDesc) {
      const statusDescData = this.statusDescRepo.setData(data);
      if (Object.entries(status).length) {
        await this.statusDescRepo.update({ status_id: id }, statusDescData);
      }
    } else {
      const statusDescData = {
        ...new StatusDescriptionEntity(),
        ...this.statusDescRepo.setData(data),
        status_id: id,
      };
      await this.statusDescRepo.create(statusDescData);
    }
    return this.getById(id);
  }
}
