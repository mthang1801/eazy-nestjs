import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { UserGroupEntity } from '../entities/usergroups.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
import { UserGroupLinkEntity } from '../entities/usergroupLinks.entity';
import { Like, IsNull } from '../../database/find-options/operators';
import { CreateUserGroupsDto } from '../dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from '../dto/usergroups/update-usergroups.dto';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { IUserGroup } from '../interfaces/usergroups.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { userGroupSearchByNameCode } from 'src/utils/tableConditioner';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import { PrivilegeRepository } from '../repositories/privilege.repository';
import { PrivilegeEntity } from '../entities/privilege.entity';
import { convertToMySQLDateTime } from 'src/utils/helper';

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
    const userGroupData = {
      ...new UserGroupEntity(),
      ...this.userGroupRepo.setData(data),
    };

    const newUserGroup = await this.userGroupRepo.create(userGroupData);
    let result = { ...newUserGroup };

    const userGroupDescData = {
      ...new UserGroupDescriptionEntity(),
      ...this.userGroupDescriptionRepo.setData(data),
      usergroup_id: result.usergroup_id,
    };

    const newUserGroupDesc = await this.userGroupDescriptionRepo.create({
      ...userGroupDescData,
      usergroup_id: result.usergroup_id,
    });
    result = { ...result, ...newUserGroupDesc };

    if (data.privileges.length) {
      for (let privilegeId of data.privileges) {
        let privilege = await this.privilegeRepo.findOne({
          privilege_id: privilegeId,
        });
        // find parent
        if (privilege.level === 1) {
          let parentPrivilege = await this.privilegeRepo.findOne({
            privilege_id: privilege.parent_id,
          });
          if (parentPrivilege) {
            let parentUsergroupPrivilegeExist =
              await this.userGroupPrivilegeRepo.findOne({
                privilege_id: parentPrivilege.privilege_id,
                usergroup_id: newUserGroup.usergroup_id,
              });
            if (!parentUsergroupPrivilegeExist) {
              await this.userGroupPrivilegeRepo.createSync({
                privilege_id: parentPrivilege.privilege_id,
                usergroup_id: newUserGroup.usergroup_id,
              });
            }
          }
        }
        await this.userGroupPrivilegeRepo.createSync({
          privilege_id: privilegeId,
          usergroup_id: newUserGroup.usergroup_id,
        });
      }
    }

    return result;
  }

  async getByUserGroupId(id: number): Promise<any> {
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
    if (!userGroup) {
      throw new HttpException('Không tìm thấy nhóm người dùng', 404);
    }
    let parentPrivileges = await this.userGroupPrivilegeRepo.find({
      select: ['*'],
      join: {
        [JoinTable.rightJoin]: {
          [Table.PRIVILEGES]: {
            fieldJoin: 'privilege_id',
            rootJoin: 'privilege_id',
          },
        },
      },
      where: {
        [`${Table.PRIVILEGES}.level`]: 0,
        [`${Table.USER_GROUP_PRIVILEGES}.usergroup_id`]: userGroup.usergroup_id,
      },
    });

    for (let parentPrivilegeItem of parentPrivileges) {
      let childrenPrivilege = await this.userGroupPrivilegeRepo.find({
        select: ['*'],
        join: {
          [JoinTable.rightJoin]: {
            [Table.PRIVILEGES]: {
              fieldJoin: 'privilege_id',
              rootJoin: 'privilege_id',
            },
          },
        },
        where: {
          [`${Table.PRIVILEGES}.level`]: 1,
          [`${Table.USER_GROUP_PRIVILEGES}.usergroup_id`]:
            userGroup.usergroup_id,
          [`${Table.PRIVILEGES}.parent_id`]: parentPrivilegeItem.privilege_id,
        },
      });
      parentPrivilegeItem['children'] = childrenPrivilege;
    }
    userGroup['privileges'] = parentPrivileges;
    return userGroup;
  }

  async getList(user, params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

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
      orderBy: [
        { field: 'updated_at', sortBy: SortBy.DESC },
        { field: 'created_at', sortBy: SortBy.DESC },
      ],
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

  async update(usergroup_id: number, data: UpdateUserGroupsDto): Promise<any> {
    const currentUserGroup = await this.userGroupRepo.findOne({
      usergroup_id,
    });

    if (!currentUserGroup) {
      throw new HttpException('Không tìm thấy usergroup', 404);
    }

    let result = { ...currentUserGroup };

    const userGroupData = this.userGroupRepo.setData({
      ...data,
      updated_at: convertToMySQLDateTime(),
    });
    if (Object.entries(userGroupData).length) {
      const updatedUserGroup = await this.userGroupRepo.update(
        { usergroup_id },
        userGroupData,
      );

      result = { ...result, ...updatedUserGroup };
    }

    const userGroupDescData = this.userGroupDescriptionRepo.setData(data);
    if (Object.entries(userGroupData).length) {
      const updatedUserGroupDesc = await this.userGroupDescriptionRepo.update(
        { usergroup_id },
        userGroupDescData,
      );
      result = { ...result, ...updatedUserGroupDesc };
    }

    await this.userGroupPrivilegeRepo.delete({ usergroup_id });

    if (data.privileges.length) {
      for (let privilegeId of data.privileges) {
        let privilege = await this.privilegeRepo.findOne({
          privilege_id: privilegeId,
        });

        // find parent
        if (privilege && privilege.level === 1 && privilege.parent_id) {
          let parentPrivilege = await this.privilegeRepo.findOne({
            privilege_id: privilege.parent_id,
          });

          if (parentPrivilege) {
            let parentUsergroupPrivilegeExist =
              await this.userGroupPrivilegeRepo.findOne({
                privilege_id: parentPrivilege.privilege_id,
                usergroup_id: currentUserGroup.usergroup_id,
              });
            if (!parentUsergroupPrivilegeExist) {
              await this.userGroupPrivilegeRepo.createSync({
                privilege_id: parentPrivilege.privilege_id,
                usergroup_id: currentUserGroup.usergroup_id,
              });
            }
          }
        }
        if (privilege) {
          await this.userGroupPrivilegeRepo.createSync({
            privilege_id: privilegeId,
            usergroup_id: currentUserGroup.usergroup_id,
          });
        }
      }
    }

    return result;
  }
}
