import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { UserGroupEntity } from '../entities/usergroups.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
import { UserGroupLinkEntity } from '../entities/usergroupLinks.entity';
import { Like } from '../../database/find-options/operators';
import { CreateUserGroupsDto } from '../dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from '../dto/usergroups/update-usergroups.dto';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { IUserGroup } from '../interfaces/usergroups.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { userSearchByNameEmailPhone } from 'src/utils/tableConditioner';

@Injectable()
export class UserGroupsService {
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
  ) {}

  async create(data: CreateUserGroupsDto): Promise<IUserGroup> {
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

  async getByUserGroupId(id: number): Promise<IUserGroup> {
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

  async getList(params): Promise<any> {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 4;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.userRepository.tableProps.includes(key)) {
          if (key === 'status') {
            filterCondition[`${Table.USERS}.${key}`] = val;
            continue;
          }
          filterCondition[`${Table.USERS}.${key}`] = Like(val);
          continue;
        }

        if (this.userGroupRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_GROUPS}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.USER_GROUP_DESCRIPTIONS}.${key}`] =
            Like(val);
        }
      }
    }

    const count = await this.userRepository.find({
      select: [`COUNT(DISTINCT(${Table.USERS}.user_id)) as total`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
        },
      },
      where: search
        ? userSearchByNameEmailPhone(search, filterCondition)
        : filterCondition,
    });

    const userGroups = await this.userRepository.find({
      select: ['*', `${Table.USERS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
        },
      },
      where: search
        ? userSearchByNameEmailPhone(search, filterCondition)
        : filterCondition,
      skip,
      limit,
    });

    return {
      userGroups,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count ? count[0].total : 0,
      },
    };
  }

  async update(id: number, data: UpdateUserGroupsDto): Promise<IUserGroup> {
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
}
