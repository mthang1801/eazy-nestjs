import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { RoleEntity } from '../entities/role.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { RoleRepository } from '../repositories/role.repository';

import { UserRoleRepository } from '../repositories/userRole.repository';
import { UserRoleEntity } from '../entities/userRole.entity';
import {
  Like,
  IsNull,
  Not,
  Equal,
  MoreThanOrEqual,
} from '../../database/operators/operators';
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
import { UpdateRoleGroupDto } from '../dto/role/update-roleGroup.dto';
import { groupListSearchFilter } from '../../utils/tableConditioner';
import { AuthorizeRoleFunctionDto } from '../dto/userRole/authorizeRoleFunct';
import { userRoleJoiner, roleFunctJoiner } from '../../utils/joinTable';
import {
  userRoleFunctJoiner,
  userRoleFunctInfoJoiner,
} from '../../utils/joinTable';

@Injectable()
export class RoleService {
  constructor(
    private roleRepo: RoleRepository<RoleEntity>,
    private roleFunctRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private userRoleRepo: UserRoleRepository<UserRoleEntity>,
    private userRepo: UserRepository<UserEntity>,
    private userGroupPrivilegeRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private functRepo: FunctRepository<FunctEntity>,
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
        let privilege = await this.functRepo.findOne({
          privilege_id: privilegeId,
        });
        // find parent
        if (privilege.level === 1) {
          let parentPrivilege = await this.functRepo.findOne({
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
        true,
      );

      result = { ...result, ...updatedUserGroup };
    }

    if (data?.privileges?.length) {
      await this.userGroupPrivilegeRepo.delete({ usergroup_id });

      for (let privilegeId of data.privileges) {
        let privilege = await this.functRepo.findOne({
          privilege_id: privilegeId,
        });

        // find parent
        if (privilege && privilege.level === 1 && privilege.parent_id) {
          let parentPrivilege = await this.functRepo.findOne({
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

  async createRoleGroup(data: CreateGroupDto, user) {
    const currentRoleFunct = await this.userRoleRepo.findOne({
      select: `*, ${Table.ROLE}.level`,
      join: userRoleFunctInfoJoiner,
      where: {
        [`${Table.USER_ROLES}.user_id`]: user.user_id,
        [`${Table.FUNC}.funct_code`]: 'create-user-group',
      },
    });

    if (!currentRoleFunct) {
      throw new HttpException(
        'Bạn không được cấp quyền để tạo nhóm người dùng.',
        400,
      );
    }

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
      created_by: user['user_id'],
      updated_by: user['user_id'],
      level: currentRoleFunct.level + 1,
      parent_id: currentRoleFunct.role_id,
    };

    const group = await this.roleRepo.create(groupData);

    return this.getGroupById(group.role_id);
  }

  async getGroupList(params, user) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;

    const currentRoleFunct = await this.userRoleRepo.findOne({
      select: `*, ${Table.ROLE}.level`,
      join: userRoleJoiner,
      where: {
        [`${Table.USER_ROLES}.user_id`]: user.user_id,
      },
    });

    console.log(currentRoleFunct);

    let filterCondition = {
      [`${Table.ROLE}.level`]: MoreThanOrEqual(currentRoleFunct.level),
    };

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

  async authorizeRoleFunct(role_id: number, data: AuthorizeRoleFunctionDto) {
    const groupRole = await this.roleRepo.findOne({ role_id });
    if (!groupRole) {
      throw new HttpException('Không tìm thấy nhóm người dùng.', 404);
    }

    const groupRoleData = {
      ...this.roleRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };
    await this.roleRepo.update({ role_id }, groupRoleData);

    if (data.funct_ids && data.funct_ids.length) {
      await this.roleFunctRepo.delete({ role_id });
      for (let functId of data.funct_ids) {
        for (let i = 1; i <= 5; i++) {
          await this.roleFunctRepo.create({
            role_id,
            funct_id: functId,
            permission: i,
          });
        }
      }
    }
  }

  async getFunctions() {
    const rootFunctions = await this.functRepo.find({
      level: 0,
      is_role_display: 'Y',
    });

    if (rootFunctions && rootFunctions.length) {
      for (let functItemLv0 of rootFunctions) {
        const childrenFunctsLv1 = await this.functRepo.find({
          parent_id: functItemLv0['funct_id'],
          level: 1,
        });

        for (let functItemLv1 of childrenFunctsLv1) {
          const childrenFunctsLv2 = await this.functRepo.find({
            parent_id: functItemLv1['funct_id'],
            level: 2,
          });
          functItemLv1['children'] = childrenFunctsLv2;
        }
        functItemLv0['children'] = childrenFunctsLv1;
      }
    }

    return rootFunctions;
  }

  async updateRoleGroup(id: number, data: UpdateRoleGroupDto, user) {
    const roleGroup = await this.roleRepo.findOne({ role_id: id });
    if (!roleGroup) {
      throw new HttpException('Không tìm thấy nhóm.', 404);
    }

    if (roleGroup.level === 0) {
      throw new HttpException(
        'Không thể thay đổi quyền của quản trị viên',
        400,
      );
    }

    let currentRoleFunct = await this.userRoleRepo.findOne({
      select: `*, ${Table.ROLE}.level`,
      join: userRoleJoiner,
      where: {
        [`${Table.USER_ROLES}.user_id`]: user.user_id,
      },
    });

    if (roleGroup.level === currentRoleFunct.level) {
      throw new HttpException(
        'Không thể thay đổi quyền, vui lòng liên hệ quản trị viên.',
        400,
      );
    }

    if (roleGroup.level < currentRoleFunct.level) {
      throw new HttpException(
        'Không thể gán quyền cho nhóm có cấp độ cao hơn.',
        400,
      );
    }

    const checkList = await this.roleRepo.find();

    if (
      data.role_name &&
      checkList.some(
        (item) =>
          item.role_name.toLowerCase().trim() ==
            removeMoreThanOneSpace(data.role_name).toLowerCase().trim() &&
          item.role_id !== roleGroup.role_id,
      )
    ) {
      throw new HttpException('Tên nhóm đã tồn tại', 409);
    }

    let newGroupData = {
      ...this.roleRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
      updated_by: user['user_id'],
    };

    if (data.role_name) {
      newGroupData['role_name'] = removeMoreThanOneSpace(data.role_name).trim();
    }

    await this.roleRepo.update(
      {
        role_id: id,
        parent_id: currentRoleFunct.role_id,
        updated_by: user.user_id,
        level: currentRoleFunct.level + 1,
      },
      newGroupData,
    );

    if (!data.funct_ids) {
      return;
    }
    await this.roleFunctRepo.delete({ role_id: id });
    if (data.funct_ids && data.funct_ids.length) {
      data.funct_ids = [...new Set([1, ...data.funct_ids])];

      for (let functId of data.funct_ids) {
        const roleFunct = await this.functRepo.findOne({ funct_id: functId });
        if (roleFunct) {
          await this.roleFunctRepo.create({
            role_id: id,
            funct_id: functId,
            updated_by: user.user_id,
            created_by: user.user_id,
          });
        }
      }
    }
  }

  async checkUserRole(user_id, method, path) {
    const userRole = await this.userRoleRepo.findOne({ user_id });
    if (!userRole) {
      return false;
    }

    console.log(method, path);
    let roleGroup = await this.roleFunctRepo.findOne({
      select: '*',
      join: roleFunctJoiner,
      where: {
        [`${Table.ROLE_FUNC}.role_id`]: userRole.role_id,
        [`${Table.FUNC}.method`]: method,
        [`${Table.FUNC}.be_route`]: path,
      },
    });

    if (!roleGroup) {
      roleGroup = await this.roleFunctRepo.findOne({
        select: '*',
        join: roleFunctJoiner,
        where: {
          [`${Table.FUNC}.method`]: method,
          [`${Table.FUNC}.be_route`]: path,
        },
      });
      if (roleGroup) {
        throw new HttpException(
          [
            `Bạn không được cấp quyền truy cập vào ${roleGroup.funct_name}`,
            roleGroup.funct_name,
          ],
          423,
        );
      }
      throw new HttpException(`Yêu cầu truy cập bị từ chối.`, 401);
    }
  }
}
