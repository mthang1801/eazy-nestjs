import { Injectable, HttpException } from '@nestjs/common';
import * as _ from 'lodash';

import { Table } from '../../database/enums/tables.enum';

import { UserRepository } from '../repositories/user.repository';
import { RoleEntity } from '../entities/role.entity';
import { UserEntity } from '../entities/user.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';

import {
  UserGroupStatusEnum,
  UserGroupTypeEnum,
} from '../../database/enums/tableFieldEnum/userGroups.enum';
import { RoleRepository } from '../repositories/role.repository';

import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';

import { Like } from 'src/database/operators/operators';
import { UserGroupLinkEntity } from '../entities/usergroupLinks.entity';
import { UpdateUserGroupLinkDto } from '../dto/usergroups/update-usergroupLink.dto';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import {
  IUserGroupLink,
  IUserGroupLinkExtend,
} from '../interfaces/usergroupLink.interface';

@Injectable()
export class UserGroupLinkService {
  constructor(
    private userGroupRepo: RoleRepository<RoleEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
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
        if (this.userGroupLinksRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_ROLES}.${key}`] = Like(val);
          continue;
        }
        if (this.userGroupRepo.tableProps.includes(key)) {
          filterCondition[`${Table.ROLE}.${key}`] = Like(val);
          continue;
        }
      }
    const userGroupLinks = await this.userRepo.find({
      select: ['*', `${Table.USERS}.*`],
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
    const userGroupLink = await this.userGroupLinksRepo.findOne({ user_id });
    if (!userGroupLink) {
      throw new HttpException('Người dùng không tồn tại.', 404);
    }
    const updatedUserGroupLink = await this.userGroupLinksRepo.update(
      userGroupLink.link_id,
      data,
    );
    return updatedUserGroupLink;
  }

  async createUserGroupLinkPosition(
    user_id: number,
    position: string = UserGroupTypeEnum.Customer,
  ): Promise<any> {
    const userGroupForCustomer = await this.userGroupRepo.findOne({
      select: ['*'],
      where: {
        status: UserGroupStatusEnum.Active,
        type: position,
        company_id: 0,
      },
    });
    const newUserGroupLink: UserGroupLinkEntity =
      await this.userGroupLinksRepo.create({
        user_id: user_id,
        usergroup_id: userGroupForCustomer.usergroup_id,
      });
    return { ...userGroupForCustomer, ...newUserGroupLink };
  }
}
