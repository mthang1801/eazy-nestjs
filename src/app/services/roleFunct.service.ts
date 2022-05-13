import { HttpException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { RoleFunctionRepository } from '../repositories/roleFunction.repository';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';
import { JoinTable, Table } from 'src/database/enums';
import { Like } from '../../database/operators/operators';
import { CreateUserGroupPrivilegeDto } from '../dto/usergroups/create-usergroupPrivilege.dto';
import { UpdateUserGroupPrivilegeDto } from '../dto/usergroups/update-usergroupPrivilege.dto';
import { IUserGroupPrivilege } from '../interfaces/usergroupPrivilege.interface';
import { FunctRepository } from '../repositories/funct.repository';
import { FunctEntity } from '../entities/funct.entity';
import { UserRoleRepository } from '../repositories/userRole.repository';
import { UserRoleEntity } from '../entities/userRole.entity';

@Injectable()
export class RoleFunctService {
  constructor(
    private userGroupPrivilegeRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private privilegeRepo: FunctRepository<FunctEntity>,
    private userGroupLinksRepo: UserRoleRepository<UserRoleEntity>,
  ) {}

  async create(data: CreateUserGroupPrivilegeDto): Promise<void> {}

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

  getUserGroupPrivilegeShorten(userGroupPrivilege: RoleFunctionEntity) {
    if (!userGroupPrivilege) {
      return;
    }

    return userGroupPrivilege;
  }

  async getList(user): Promise<any> {
    const currentUserGroup = await this.userGroupLinksRepo.findOne({
      user_id: user.user_id,
    });

    if (!currentUserGroup) {
      throw new HttpException('Không tìm thấy nhóm người dùng', 404);
    }

    const privilegeTitlesList = await this.userGroupPrivilegeRepo.find({
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
        [`${Table.ROLE_FUNC}.usergroup_id`]: currentUserGroup.usergroup_id,
        level: 0,
      },
    });

    let result = [];

    for (let privilegeItem of privilegeTitlesList) {
      let privilegesList = await this.privilegeRepo.find({
        select: ['*'],
        where: {
          parent_id: privilegeItem.privilege_id,
        },
      });
      result = [...result, { ...privilegeItem, children: privilegesList }];
    }

    return result;
  }

  async update(
    id: number,
    data: UpdateUserGroupPrivilegeDto,
  ): Promise<IUserGroupPrivilege> {
    const updatedGroupPrivilege = await this.userGroupPrivilegeRepo.update(
      id,
      data,
      true,
    );
    return updatedGroupPrivilege;
  }

  async delete(privilege_id: number): Promise<boolean> {
    return this.userGroupPrivilegeRepo.delete(privilege_id);
  }
}
