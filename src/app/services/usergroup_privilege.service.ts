import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { UserGroupPrivilegesRepository } from '../repositories/usergroup_privileges.repository';
import {
  CreateUserGroupPrivilegeDto,
  UpdateUserGroupPrivilegeDto,
} from '../dto/usergroups/usergroup_privilege.dto';
import { UserGroupPrivilegeEntity } from '../entities/usergroup_privilege.entity';
import { Table } from 'src/database/enums';
import { Like } from '../../database/find-options/operators';

@Injectable()
export class UserGroupsPrivilegeService {
  constructor(
    private userGroupPrivilegeRepo: UserGroupPrivilegesRepository<UserGroupPrivilegeEntity>,
  ) {}

  async create(
    data: CreateUserGroupPrivilegeDto,
  ): Promise<UserGroupPrivilegeEntity> {
    const newUserGroupPrivilege = await this.userGroupPrivilegeRepo.create(
      data,
    );
    return newUserGroupPrivilege;
  }

  async getListByUserGroupId(usergroup_id: number): Promise<any> {
    const userGroupPrivilegeRawList: UserGroupPrivilegeEntity[] =
      await this.userGroupPrivilegeRepo.find({
        where: { usergroup_id },
      });
    console.log(userGroupPrivilegeRawList);
    const userGroupPrivilegeRawListSortByLevel = _.sortBy(
      userGroupPrivilegeRawList,
      [
        function (item) {
          return item.level;
        },
      ],
    );

    let menu = [];
    for (let userGroupPrivilegeItem of userGroupPrivilegeRawListSortByLevel) {
      if (userGroupPrivilegeItem.level === 1) {
        menu.push({ ...userGroupPrivilegeItem, children: [] });
        continue;
      }
      if (userGroupPrivilegeItem.level === 2) {
        menu = menu.map((menuItem) => {
          if (
            menuItem.level === 1 &&
            menuItem.privilege_id === userGroupPrivilegeItem.parent_id
          ) {
            menuItem.children.push(userGroupPrivilegeItem);
          }
          return menuItem;
        });
      }
    }

    return menu;
  }

  async getAll(params): Promise<UserGroupPrivilegeEntity[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;
    let filterCondition = {};

    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        filterCondition[`${Table.USER_GROUP_PRIVILEGES}.${key}`] = Like(val);
      }
    }
    let userGroupPrivilegeData = await this.userGroupPrivilegeRepo.find({
      select: ['*'],
      where: filterCondition,
      skip,
      limit,
    });

    return userGroupPrivilegeData;
  }

  async update(
    id: number,
    data: UpdateUserGroupPrivilegeDto,
  ): Promise<UserGroupPrivilegeEntity> {
    const updatedGroupPrivilege = await this.userGroupPrivilegeRepo.update(
      id,
      data,
    );
    return updatedGroupPrivilege;
  }

  async delete(privilege_id: number): Promise<boolean> {
    return this.userGroupPrivilegeRepo.delete(privilege_id);
  }
}
