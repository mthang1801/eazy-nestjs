import { Injectable, HttpException } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { UserRepository } from '../repositories/user.repository';
import {
  UserGroupDescriptionEntity,
  UserGroupEntity,
} from '../entities/usergroups.entity';
import { UserEntity } from '../entities/user.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';

import {
  UserGroupStatusEnum,
  UserGroupTypeEnum,
} from '../../database/enums/tableFieldEnum/user_groups.enum';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroup_descriptions.repository';
import { UserGroupLinksRepository } from '../repositories/usergroup_links.repository';
import { UpdateUserGroupLinkDto } from '../dto/usergroups/usergroup_link.dto';
import { Like } from 'src/database/find-options/operators';
import { UserGroupLinkEntity } from '../entities/usergroup_links.entity';

@Injectable()
export class UserGroupLinkService {
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userRepo: UserRepository<UserEntity>,
  ) {}

  async getAll(params: any): Promise<UserGroupLinkEntity[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    const skip = (page - 1) * limit;
    let filterCondition = {};
    if (typeof others === 'object' && Object.entries(others).length)
      for (let [key, val] of Object.entries(others)) {
        if (this.userGroupLinksRepo.userGroupLinkProps.includes(key)) {
          filterCondition[`${Table.USER_GROUP_LINKS}.${key}`] = Like(val);
          continue;
        }
        if (this.userGroupRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_GROUPS}.${key}`] = Like(val);
          continue;
        }
        if (this.userGroupDescriptionRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_GROUP_DESCRIPTIONS}.${key}`] =
            Like(val);
          continue;
        }
      }
    const userGroupLinks = await this.userRepo.find({
      select: ['*', `${Table.USERS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
          },
        },
      },
      where: { ...filterCondition },
      skip,
      limit,
    });

    return userGroupLinks;
  }

  async getListUsersByUserGroupId(
    usergroup_id: number,
    query: any,
  ): Promise<UserGroupLinkEntity[]> {
    let { page, limit } = query;
    page = +page || 1;
    limit = +limit || 9999;
    const skip = (page - 1) * limit;

    const userGroupLink = await this.userRepo.find({
      select: ['*', `${Table.USER_GROUP_LINKS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
          },
        },
      },
      where: { [`${Table.USER_GROUPS}.usergroup_id`]: usergroup_id },
      skip,
      limit,
    });
    return userGroupLink;
  }

  async updateByUserId(
    user_id: number,
    data: UpdateUserGroupLinkDto,
  ): Promise<UserGroupLinkEntity> {
    const userGroupLink = await this.userGroupLinksRepo.findOne({ user_id });
    if (!userGroupLink) {
      throw new HttpException('Người dùng không tồn tại.', 404);
    }
    const updatedUserGroupLink = await this.userGroupLinksRepo.update(
      userGroupLink.link_id,
      data,
    );
    return updatedUserGroupLink;
  }

  async createUserGroupLinkPosition(
    user_id: number,
    position: string = UserGroupTypeEnum.Customer,
  ): Promise<any> {
    const userGroupForCustomer: UserGroupEntity =
      await this.userGroupRepo.findOne({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.USER_GROUP_DESCRIPTIONS]: {
              fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
              rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
            },
          },
        },
        where: {
          status: UserGroupStatusEnum.Active,
          type: position,
          company_id: 0,
        },
      });
    const newUserGroupLink: UserGroupLinkEntity =
      await this.userGroupLinksRepo.create({
        user_id: user_id,
        usergroup_id: userGroupForCustomer.usergroup_id,
      });
    return { ...userGroupForCustomer, ...newUserGroupLink };
  }
}
