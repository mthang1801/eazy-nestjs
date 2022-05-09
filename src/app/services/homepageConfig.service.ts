import { Injectable } from '@nestjs/common';
import { HomepageConfigModuleEntity } from '../entities/homepageConfigModule.entity';
import { HomepageConfigModuleRepository } from '../repositories/homepageModule.repository';
import { HomepageConfigModuleItemRepository } from '../repositories/homepageModuleItem.repository';
import { HomepageConfigModuleItemEntity } from '../entities/homepageConfigModuleItem.entity';
import { Table } from 'src/database/enums';

@Injectable()
export class HomepageConfigService {
  constructor(
    private homepageModuleRepo: HomepageConfigModuleRepository<HomepageConfigModuleEntity>,
    private homepageModuleItemRepo: HomepageConfigModuleItemRepository<HomepageConfigModuleItemEntity>,
  ) {}
  async create(data) {
    let homepageModule;
    if (data['module_id']) {
      homepageModule = await this.homepageModuleRepo.findOne({
        module_id: data['module_id'],
      });
    }
    if (homepageModule) {
      const updatedHomepageModuleData = this.homepageModuleRepo.setData(data);
      if (data['data']) {
        updatedHomepageModuleData['data'] = JSON.stringify(data['data']);
      }
      if (Object.entries(updatedHomepageModuleData).length) {
        homepageModule = await this.homepageModuleRepo.update(
          {
            module_id: homepageModule.module_id,
          },
          updatedHomepageModuleData,
          true,
        );
      }
    } else {
      let newHomepageModuleData = {
        ...new HomepageConfigModuleEntity(),
        ...this.homepageModuleRepo.setData(data),
      };

      if (data['data']) {
        newHomepageModuleData['data'] = JSON.stringify(data['data']);
      }
      homepageModule = await this.homepageModuleRepo.create(
        newHomepageModuleData,
      );
    }
  }

  async getList(params) {
    let { device_type } = params;

    const listData = await this.homepageModuleRepo.find({
      select: '*',
      where: {
        [`${Table.HOMEPAGE_MODULE}.device_type`]: device_type
          ? device_type
          : 'D',
      },
      orderBy: [
        {
          field: `CASE WHEN ${Table.HOMEPAGE_MODULE}.position`,
          sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.HOMEPAGE_MODULE}.position ASC`,
        },
      ],
    });

    const result = listData.map((dataItem) => {
      if (dataItem) {
        let _res = { ...dataItem };
        if (dataItem.data) {
          _res['data'] = JSON.parse(dataItem.data);
        }
        return _res;
      }
    });

    return result;
  }

  async getById(module_id) {
    const result = await this.homepageModuleRepo.findOne({ module_id });
    if (result && result['data']) {
      result['data'] = JSON.parse(result['data']);
    }
    return result;
  }
}
