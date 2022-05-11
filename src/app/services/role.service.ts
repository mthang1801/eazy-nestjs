import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { RoleEntity } from '../entities/role.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { RoleRepository } from '../repositories/role.repository';

import { UserRoleRepository } from '../repositories/userRole.repository';
import { UserRoleEntity } from '../entities/userRole.entity';
import { Like, IsNull, Not, Equal } from '../../database/operators/operators';
import { CreateUserGroupsDto } from '../dto/usergroups/create-usergroups.dto';
import { UpdateUserGroupsDto } from '../dto/usergroups/update-usergroups.dto';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { IUserGroup } from '../interfaces/usergroups.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { userGroupSearchByNameCode } from 'src/utils/tableConditioner';
import { RoleFunctionRepository } from '../repositories/roleFunction.repository';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import { FunctRepository } from '../repositories/funct.repository';
import { FunctEntity } from '../entities/funct.entity';
import { formatStandardTimeStamp } from 'src/utils/helper';

@Injectable()
export class RoleService {
  constructor(
    private userGroupRepo: RoleRepository<RoleEntity>,
    private userGroupLinksRepo: UserRoleRepository<UserRoleEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userGroupPrivilegeRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private privilegeRepo: FunctRepository<FunctEntity>,
  ) {}

  async create(data: CreateUserGroupsDto): Promise<any> {
    const userGroupDB = await this.userGroupRepo.find({
      select: '*',
    });

    if (
      userGroupDB.some(
        ({ usergroup }) =>
          usergroup.toLowerCase().trim() ===
          data.usergroup.toLowerCase().trim(),
      )
    ) {
      throw new HttpException('Người dùng hệ thống đã tồn tại', 409);
    }

    const userGroupData = {
      ...new RoleEntity(),
      ...this.userGroupRepo.setData(data),
    };

    const newUserGroup = await this.userGroupRepo.create(userGroupData);
    let result = { ...newUserGroup };

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
              await this.userGroupPrivilegeRepo.create(
                {
                  privilege_id: parentPrivilege.privilege_id,
                  usergroup_id: newUserGroup.usergroup_id,
                },
                false,
              );
            }
          }
        }
        await this.userGroupPrivilegeRepo.create(
          {
            privilege_id: privilegeId,
            usergroup_id: newUserGroup.usergroup_id,
          },
          false,
        );
      }
    }

    return result;
  }

  async getByUserGroupId(id: number): Promise<any> {
    const userGroup = await this.userGroupRepo.findOne({
      select: ['*'],
      where: { [`${Table.ROLE}.usergroup_id`]: id },
    });
    if (!userGroup) {
      throw new HttpException('Không tìm thấy nhóm người dùng', 404);
    }
    let parentPrivileges = await this.userGroupPrivilegeRepo.find({
      select: ['*'],
      join: {
        [JoinTable.rightJoin]: {
          [Table.FUNC]: {
            fieldJoin: 'privilege_id',
            rootJoin: 'privilege_id',
          },
        },
      },
      where: {
        [`${Table.FUNC}.level`]: 0,
        [`${Table.ROLE_FUNC}.usergroup_id`]: userGroup.usergroup_id,
      },
    });

    for (let parentPrivilegeItem of parentPrivileges) {
      let childrenPrivilege = await this.userGroupPrivilegeRepo.find({
        select: ['*'],
        join: {
          [JoinTable.rightJoin]: {
            [Table.FUNC]: {
              fieldJoin: 'privilege_id',
              rootJoin: 'privilege_id',
            },
          },
        },
        where: {
          [`${Table.FUNC}.level`]: 1,
          [`${Table.ROLE_FUNC}.usergroup_id`]: userGroup.usergroup_id,
          [`${Table.FUNC}.parent_id`]: parentPrivilegeItem.privilege_id,
        },
      });
      parentPrivilegeItem['children'] = childrenPrivilege;
    }
    userGroup['privileges'] = parentPrivileges;
    return userGroup;
  }

  async getList(user, params) {
    let { page, limit, search, status } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (status) {
      filterConditions['status'] = status;
    }

    let count = await this.userGroupRepo.find({
      select: [`COUNT(DISTINCT(${Table.ROLE}.usergroup_id)) as total`],

      where: userGroupSearchByNameCode(search, filterConditions),
    });

    let userGroupsList = await this.userGroupRepo.find({
      select: ['*'],

      orderBy: [
        { field: `${Table.ROLE}.updated_at`, sortBy: SortBy.DESC },
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

    const userGroupDB = await this.userGroupRepo.find();

    if (
      data.usergroup &&
      userGroupDB.some(
        ({ usergroup }) =>
          usergroup.toLowerCase().trim() ===
          data.usergroup.toLowerCase().trim(),
      )
    ) {
      throw new HttpException('Người dùng hệ thống đã tồn tại', 409);
    }

    let result = { ...currentUserGroup };

    const userGroupData = this.userGroupRepo.setData({
      ...data,
      updated_at: formatStandardTimeStamp(),
    });

    if (Object.entries(userGroupData).length) {
      const updatedUserGroup = await this.userGroupRepo.update(
        { usergroup_id },
        userGroupData,
      );

      result = { ...result, ...updatedUserGroup };
    }

    if (data?.privileges?.length) {
      await this.userGroupPrivilegeRepo.delete({ usergroup_id });

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
              await this.userGroupPrivilegeRepo.create(
                {
                  privilege_id: parentPrivilege.privilege_id,
                  usergroup_id: currentUserGroup.usergroup_id,
                },
                false,
              );
            }
          }
        }
        if (privilege) {
          await this.userGroupPrivilegeRepo.create(
            {
              privilege_id: privilegeId,
              usergroup_id: currentUserGroup.usergroup_id,
            },
            false,
          );
        }
      }
    }

    return result;
  }
}
