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
import {
  userGroupSearchByNameCode,
  userSearchByNameEmailPhone,
} from 'src/utils/tableConditioner';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import { PrivilegeRepository } from '../repositories/privilege.repository';
import { PrivilegeEntity } from '../entities/privilege.entity';

@Injectable()
export class UserGroupsService {
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userGroupPrivilegeRepo: UserGroupPrivilegesRepository<UserGroupPrivilegeEntity>,
    private privilegeRepo: PrivilegeRepository<PrivilegeEntity>,
  ) {}

  async create(data: CreateUserGroupsDto): Promise<any> {
    const checkCode = await this.userGroupRepo.findOne({
      code: data.code.toUpperCase(),
    });
    if (checkCode) {
      throw new HttpException('Mã sản phẩm đã tồn tại', 409);
    }

    const userGroupData = {
      ...new UserGroupEntity(),
      ...this.userGroupRepo.setData(data),
      code: data.code.toUpperCase().trim(),
    };

    const newUserGroup = await this.userGroupRepo.create(userGroupData);
    let result = { ...newUserGroup };

    const userGroupDescData = {
      ...new UserGroupDescriptionEntity(),
      ...this.userGroupDescriptionRepo.setData(data),
    };
    console.log(userGroupDescData);
    const newUserGroupDesc = await this.userGroupDescriptionRepo.create({
      ...userGroupDescData,
      usergroup_id: result.usergroup_id,
    });
    result = { ...result, ...newUserGroupDesc };

    for (let privilegeId of data.privileges) {
      await this.userGroupPrivilegeRepo.createSync({
        privilege_id: privilegeId,
        usergroup_id: newUserGroup.usergroup_id,
      });
    }

    return result;
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

  async getUserLists(params): Promise<any> {
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

  async getList(user, params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    console.log(page, limit);

    let filterConditions = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.userGroupRepo.tableProps.includes(key)) {
          filterConditions[`${Table.USER_GROUPS}.${key}`] = Like(val);
          continue;
        }
        if (this.userGroupDescriptionRepo.tableProps.includes(key)) {
          filterConditions[`${Table.USER_GROUP_DESCRIPTIONS}.${key}`] =
            Like(val);
        }
      }
    }
    let count = await this.userGroupRepo.find({
      select: [`COUNT(DISTINCT(${Table.USER_GROUPS}.usergroup_id)) as total`],
      join: {
        [JoinTable.innerJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `usergroup_id`,
            rootJoin: `usergroup_id`,
          },
        },
      },
      where: userGroupSearchByNameCode(search, filterConditions),
    });

    let userGroupsList = await this.userGroupRepo.find({
      select: ['*'],
      join: {
        [JoinTable.innerJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `usergroup_id`,
            rootJoin: `usergroup_id`,
          },
        },
      },
      where: userGroupSearchByNameCode(search, filterConditions),
      skip,
      limit,
    });

    return {
      usergroups: userGroupsList,
      paging: {
        total: count.length ? count[0].total : 0,
        pageSize: limit,
        currentPage: page,
      },
    };
  }

  async update(id: number, data: UpdateUserGroupsDto): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('Người dùng không tồn tại trong hệ thống.', 404);
    }

    const userUpdateData = this.userRepository.setData(data);
    let result: any = { ...user };
    if (Object.entries(userUpdateData).length) {
      const updatedUser = await this.userRepository.update(
        { user_id: result.user_id },
        userUpdateData,
      );

      result = { ...result, ...updatedUser };
    }

    const userGroupLinkData = this.userGroupLinksRepo.setData(data);

    if (Object.entries(userGroupLinkData).length) {
      const updatedUserGroupLink = await this.userGroupLinksRepo.update(
        { user_id: result.user_id },
        userGroupLinkData,
      );
      result = { ...result, ...updatedUserGroupLink };
    }

    return result;
  }
}
