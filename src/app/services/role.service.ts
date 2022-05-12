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
import { CreateGroupDto } from '../dto/role/create-user-role.dto';
import { getPageSkipLimit, removeMoreThanOneSpace } from '../../utils/helper';
import { UpdateGroupDto } from '../dto/role/update-user-role.dto';
import { groupListSearchFilter } from '../../utils/tableConditioner';

@Injectable()
export class RoleService {
  constructor(
    private roleRepo: RoleRepository<RoleEntity>,
    private roleFunctRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private userRoleRepo: UserRoleRepository<UserRoleEntity>,
    private userRepo: UserRepository<UserEntity>,
    private userGroupPrivilegeRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private privilegeRepo: FunctRepository<FunctEntity>,
  ) {}

  async create(data: CreateUserGroupsDto): Promise<any> {
    const userGroupDB = await this.roleRepo.find({
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
      ...this.roleRepo.setData(data),
    };

    const newUserGroup = await this.roleRepo.create(userGroupData);
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
    const userGroup = await this.roleRepo.findOne({
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

    let count = await this.roleRepo.find({
      select: [`COUNT(DISTINCT(${Table.ROLE}.usergroup_id)) as total`],

      where: userGroupSearchByNameCode(search, filterConditions),
    });

    let userGroupsList = await this.roleRepo.find({
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
    const currentUserGroup = await this.roleRepo.findOne({
      usergroup_id,
    });

    if (!currentUserGroup) {
      throw new HttpException('Không tìm thấy usergroup', 404);
    }

    const userGroupDB = await this.roleRepo.find();

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

    const userGroupData = this.roleRepo.setData({
      ...data,
      updated_at: formatStandardTimeStamp(),
    });

    if (Object.entries(userGroupData).length) {
      const updatedUserGroup = await this.roleRepo.update(
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

  async createGroup(data: CreateGroupDto) {
    const checkList = await this.roleRepo.find();
    if (
      checkList.some(
        (item) =>
          item.role_name.toLowerCase().trim() ==
          removeMoreThanOneSpace(data.role_name).toLowerCase().trim(),
      )
    ) {
      throw new HttpException('Tên nhóm đã tồn tại', 409);
    }

    const groupData = {
      ...new RoleEntity(),
      ...this.roleRepo.setData(data),
      role_name: removeMoreThanOneSpace(data.role_name).trim(),
    };

    const group = await this.roleRepo.create(groupData);

    return this.getGroupById(group.role_id);
  }

  async getGroupList(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;
    let filterCondition = {};

    let groupList = await this.roleRepo.find({
      select: `*`,
      where: groupListSearchFilter(search, filterCondition),
      orderBy: [{ field: `${Table.ROLE}.updated_at`, sortBy: SortBy.DESC }],
      skip,
      limit,
    });

    let count = await this.roleRepo.find({
      select: `COUNT(DISTINCT(${Table.ROLE}.role_id)) as total `,
      where: groupListSearchFilter(search, filterCondition),
    });
    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: groupList,
    };
  }

  async getGroupById(id: number) {
    let group = await this.roleRepo.findOne({
      select: '*',
      where: {
        [`${Table.ROLE}.role_id`]: id,
      },
    });
    if (!group) {
      throw new HttpException('Không tìm thấy nhóm.', 404);
    }
    const groupFuncts = await this.roleFunctRepo.find({
      role_id: group.role_id,
    });
    group['role_functs'] = groupFuncts;

    return group;
  }

  async updateGroup(id: number, data: UpdateGroupDto) {
    const group = await this.roleRepo.findOne({ role_id: id });
    if (!group) {
      throw new HttpException('Không tìm thấy nhóm.', 404);
    }

    const checkList = await this.roleRepo.find();

    if (
      data.role_name &&
      checkList.some(
        (item) =>
          item.role_name.toLowerCase().trim() ==
            removeMoreThanOneSpace(data.role_name).toLowerCase().trim() &&
          item.role_id !== group.role_id,
      )
    ) {
      throw new HttpException('Tên nhóm đã tồn tại', 409);
    }

    let newGroupData = {
      ...new RoleEntity(),
      ...this.roleRepo.setData(data),
      role_id: id,
    };
    if (data.role_name) {
      newGroupData['role_name'] = removeMoreThanOneSpace(data.role_name).trim();
    }
    await this.roleRepo.update({ role_id: id }, newGroupData);

    await this.roleFunctRepo.delete({ role_id: id });

    for (let i = 1; i <= 5; i++) {
      const groupRole = {
        ...new RoleFunctionEntity(),
        ...this.roleFunctRepo.setData(data),
        role_id: id,
        permission: i,
      };

      await this.roleFunctRepo.create(groupRole);
    }
  }
}
