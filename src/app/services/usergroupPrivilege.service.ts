import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';
import { Table } from 'src/database/enums';
import { Like } from '../../database/find-options/operators';
import { CreateUserGroupPrivilegeDto } from '../dto/usergroups/create-usergroupPrivilege.dto';
import { UpdateUserGroupPrivilegeDto } from '../dto/usergroups/update-usergroupPrivilege.dto';
import { IUserGroupPrivilege } from '../interfaces/usergroupPrivilege.interface';

@Injectable()
export class UserGroupsPrivilegeService {
  constructor(
    private userGroupPrivilegeRepo: UserGroupPrivilegesRepository<UserGroupPrivilegeEntity>,
  ) {}

  async create(
    data: CreateUserGroupPrivilegeDto,
  ): Promise<IUserGroupPrivilege> {
    const newUserGroupPrivilege = await this.userGroupPrivilegeRepo.create(
      data,
    );
    return newUserGroupPrivilege;
  }

  async getListByUserGroupId(
    usergroup_id: number,
  ): Promise<IUserGroupPrivilege[]> {
    const userGroupPrivilegeRawList = await this.userGroupPrivilegeRepo.find({
      where: { usergroup_id },
    });

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
        menu.push({
          ...this.getUserGroupPrivilegeShorten(userGroupPrivilegeItem),
          children: [],
        });
        continue;
      }

      if (userGroupPrivilegeItem.level === 2) {
        menu = menu.map((menuItem) => {
          if (
            menuItem.level === 1 &&
            menuItem.privilege_id === userGroupPrivilegeItem.parent_id
          ) {
            menuItem.children.push({
              ...this.getUserGroupPrivilegeShorten(userGroupPrivilegeItem),
            });
          }
          return menuItem;
        });
      }
    }

    return menu;
  }

  getUserGroupPrivilegeShorten(userGroupPrivilege: UserGroupPrivilegeEntity) {
    if (!userGroupPrivilege) {
      return;
    }
    delete userGroupPrivilege.privilege;
    delete userGroupPrivilege.parent_id;
    delete userGroupPrivilege.level;
    delete userGroupPrivilege.method;

    return userGroupPrivilege;
  }

  async getList(params): Promise<IUserGroupPrivilege[]> {
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
  ): Promise<IUserGroupPrivilege> {
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
