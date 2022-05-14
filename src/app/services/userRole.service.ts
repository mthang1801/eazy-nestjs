import { RoleFunctionRepository } from './../repositories/roleFunction.repository';
import { Injectable, HttpException, HttpCode } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { UserRepository } from '../repositories/user.repository';
import { RoleEntity } from '../entities/role.entity';
import { UserEntity } from '../entities/user.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';

import {
  RoleStatusEnum,
  UserRoleTypeEnum,
} from '../../database/enums/tableFieldEnum/userGroups.enum';
import { RoleRepository } from '../repositories/role.repository';

import { UserRoleRepository } from '../repositories/userRole.repository';

import { Like } from 'src/database/operators/operators';
import { UserRoleEntity } from '../entities/userRole.entity';
import { UpdateUserGroupLinkDto } from '../dto/usergroups/update-usergroupLink.dto';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { CreateGroupDto } from '../dto/role/create-user-role.dto';
import {
  IUserGroupLink,
  IUserGroupLinkExtend,
} from '../interfaces/usergroupLink.interface';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { getPageSkipLimit } from '../../utils/helper';
import { SortBy } from '../../database/enums/sortBy.enum';
import { userSelector } from '../../utils/tableSelector';
import { UpdateRoleGroupDto } from '../dto/role/update-roleGroup.dto';

@Injectable()
export class UserRoleService {
  constructor(
    private roleRepo: RoleRepository<RoleEntity>,
    private roleFunctRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private userRoleRepo: UserRoleRepository<UserRoleEntity>,
    private userRepo: UserRepository<UserEntity>,
  ) {}

  async getList(params: any): Promise<IUserGroupLinkExtend[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    const skip = (page - 1) * limit;
    let filterCondition = {};
    if (typeof others === 'object' && Object.entries(others).length)
      for (let [key, val] of Object.entries(others)) {
        if (this.userRoleRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_ROLES}.${key}`] = Like(val);
          continue;
        }
        if (this.roleRepo.tableProps.includes(key)) {
          filterCondition[`${Table.ROLE}.${key}`] = Like(val);
          continue;
        }
      }
    const userGroupLinks = await this.userRepo.find({
      select: userSelector,
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_ROLES]: {
            fieldJoin: `${Table.USER_ROLES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.ROLE]: {
            fieldJoin: `${Table.ROLE}.usergroup_id`,
            rootJoin: `${Table.USER_ROLES}.usergroup_id`,
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
    params: any,
  ): Promise<IUserGroupLinkExtend[]> {
    let { page, limit } = params;
    page = +page || 1;
    limit = +limit || 20;
    const skip = (page - 1) * limit;

    const userGroupLink = await this.userRepo.find({
      select: ['*', `${Table.USER_ROLES}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_ROLES]: {
            fieldJoin: `${Table.USER_ROLES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.ROLE]: {
            fieldJoin: `${Table.ROLE}.usergroup_id`,
            rootJoin: `${Table.USER_ROLES}.usergroup_id`,
          },
        },
      },
      where: { [`${Table.ROLE}.usergroup_id`]: usergroup_id },
      skip,
      limit,
    });
    return userGroupLink;
  }

  async updateByUserId(
    user_id: number,
    data: UpdateUserGroupLinkDto,
  ): Promise<IUserGroupLink> {
    const userGroupLink = await this.userRoleRepo.findOne({ user_id });
    if (!userGroupLink) {
      throw new HttpException('Người dùng không tồn tại.', 404);
    }
    const updatedUserGroupLink = await this.userRoleRepo.update(
      userGroupLink.link_id,
      data,
      true,
    );
    return updatedUserGroupLink;
  }

  async createUserGroupLinkPosition(
    user_id: number,
    position: string = UserRoleTypeEnum.Customer,
  ): Promise<any> {
    const userGroupForCustomer = await this.roleRepo.findOne({
      select: ['*'],
      where: {
        status: RoleStatusEnum.Active,
        type: position,
        company_id: 0,
      },
    });
    const newUserGroupLink: UserRoleEntity = await this.userRoleRepo.create({
      user_id: user_id,
      usergroup_id: userGroupForCustomer.usergroup_id,
    });
    return { ...userGroupForCustomer, ...newUserGroupLink };
  }
}
