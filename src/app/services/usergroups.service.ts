import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import {
  UserGroupDescriptionEntity,
  UserGroupEntity,
} from '../entities/usergroups.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
import { UserGroupLinksRepository } from '../repositories/usergroup_links.repository';
import { UserGroupLinkEntity } from '../entities/usergroup_links.entity';
import { Like } from '../../database/find-options/operators';
import {
  CreateUserGroupsDto,
  UpdateUserGroupsDto,
} from '../dto/usergroups/usergroups.dto';

@Injectable()
export class UserGroupsService {
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
  ) {}

  async create(data: CreateUserGroupsDto): Promise<any> {
    const userGroupData = this.userGroupRepo.setData(data);

    const userGroup = await this.userGroupRepo.create(userGroupData);

    const userGroupDescriptionData =
      this.userGroupDescriptionRepo.setData(data);

    const userGroupDescription = await this.userGroupDescriptionRepo.create({
      usergroup_id: userGroup.usergroup_id,
      ...userGroupDescriptionData,
    });

    return { ...userGroup, ...userGroupDescription };
  }

  async get(id: number): Promise<UserGroupEntity> {
    const userGroup = await this.userGroupRepo.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
          },
        },
      },
      where: { [`${Table.USER_GROUPS}.usergroup_id`]: id },
    });
    return userGroup;
  }

  async getAll(params): Promise<UserGroupEntity[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.userGroupRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_GROUPS}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.USER_GROUP_DESCRIPTIONS}.${key}`] =
            Like(val);
        }
      }
    }

    const userGroups = await this.userGroupRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
          },
        },
      },
      where: filterCondition,
      skip,
      limit,
    });
    return userGroups;
  }

  async update(id: number, data: UpdateUserGroupsDto): Promise<any> {
    let userGroup = await this.userGroupRepo.findById(id);
    if (!userGroup) {
      throw new HttpException(
        'Không tìm thấy usergroup phù hợp',
        HttpStatus.NOT_FOUND,
      );
    }
    const userGroupData = this.userGroupRepo.setData(data);

    if (Object.entries(userGroupData).length) {
      userGroup = await this.userGroupRepo.update(id, userGroupData);
    }

    const userGroupDescriptionData =
      this.userGroupDescriptionRepo.setData(data);

    let userGroupDescription = await this.userGroupDescriptionRepo.findOne({
      usergroup_id: id,
    });
    if (userGroupDescription) {
      userGroupDescription = await this.userGroupDescriptionRepo.update(
        userGroupDescription.list_id,
        userGroupDescriptionData,
      );
    }

    return { ...userGroup, ...userGroupDescription };
  }

  async delete(id: number): Promise<boolean> {
    const findUserExistInGroup = await this.userGroupLinksRepo.findOne({
      usergroup_id: id,
    });
    if (findUserExistInGroup) {
      throw new HttpException(
        'Không thể xoá usergroup này vì còn user trong đó.',
        HttpStatus.FORBIDDEN,
      );
    }
    const deletedUserGroup = await this.userGroupRepo.delete({
      usergroup_id: id,
    });
    await this.userGroupDescriptionRepo.delete({ usergroup_id: id });
    await this.userGroupLinksRepo.delete({ usergroup_id: id });
    return deletedUserGroup;
  }
}
