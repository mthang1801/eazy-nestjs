import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import {
  UserGroupsRepository,
  UserGroupDescriptionsRepository,
  UserGroupLinksRepository,
  UserGroupPrivilegesRepository,
} from '../repositories/user_groups.repository';

import { Table } from '../../database/enums/tables.enum';
import {
  CreateUserGroupsDto,
  CreateUserGroupDescriptionDto,
  CreateUserGroupLinkDto,
} from '../dto/usergroups/create-usergroups.dto';
import { UserRepository } from '../repositories/user.repository';
import {
  UserGroupDescriptionEntity,
  UserGroupEntity,
  UserGroupLinkEntity,
  UserGroupPrivilegeEntity,
} from '../entities/user_groups';
import { UserEntity } from '../entities/user.entity';
import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/auth_provider.enum';
import { convertToMySQLDateTime, formatDate } from '../../utils/helper';
import { IUserGroupLink } from '../interfaces/user_groups.interface';
import {
  UpdateUserGroupsDto,
  UpdateUserGroupDescriptionDto,
} from '../dto/usergroups/update-usergroups.dto';
import { JoinTable } from '../../database/enums/joinTable.enum';
import {
  UpdateUserGroupLinkDto,
  UpdateUserGroupPrivilegeDto,
} from '../dto/usergroups/update-usergroups.dto';
import { CreateUserGroupPrivilegeDto } from '../dto/usergroups/create-usergroups.dto';
import {
  UserGroupStatusEnum,
  UserGroupTypeEnum,
} from '../../database/enums/tableFieldEnum/user_groups.enum';

@Injectable()
export class UserGroupsService {
  private userGroupTable: Table = Table.USER_GROUPS;
  private userGroupPrivilegeTable: Table = Table.USER_GROUP_PRIVILEGES;
  private userGroupDescriptionsTable: Table = Table.USER_GROUP_DESCRIPTIONS;
  private userGroupLinksTable: Table = Table.USER_GROUP_LINKS;
  private userTable: Table = Table.USERS;
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupPrivilegeRepo: UserGroupPrivilegesRepository<UserGroupPrivilegeEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userRepo: UserRepository<UserEntity>,
  ) {}

  async createUserGroupLinkPosition(
    user_id: number,
    position: string = UserGroupTypeEnum.Customer,
  ): Promise<any> {
    const userGroupForCustomer: UserGroupEntity =
      await this.userGroupRepo.findOne({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.USER_GROUP_DESCRIPTIONS]: {
              fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
              rootJoin: `${Table.USER_GROUPS}.usergroup_id`,
            },
          },
        },
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

  async createUserGroup(
    createUserGroupsDto: CreateUserGroupsDto,
  ): Promise<any> {
    if (
      !createUserGroupsDto.status &&
      !createUserGroupsDto.company_id &&
      !createUserGroupsDto.type
    ) {
      throw new HttpException(
        'Tạo mới không thành công do tất cả các trường đều bỏ trống',
        HttpStatus.BAD_REQUEST,
      );
    }
    const checkUserGroupExist = await this.userGroupRepo.findOne({
      where: {
        type: createUserGroupsDto?.type,
        company_id: createUserGroupsDto?.company_id,
      },
    });
    if (checkUserGroupExist) {
      throw new HttpException(
        'UserGroup đã tồn tại.',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    const newUserGroup = await this.userGroupRepo.create({
      status: createUserGroupsDto.status || UserGroupStatusEnum.Active,
      type: createUserGroupsDto?.type || UserGroupTypeEnum.Wholesale,
      company_id: createUserGroupsDto?.company_id || 0,
    });

    if (createUserGroupsDto.description && createUserGroupsDto.lang_code) {
      const newUserGroupDescription =
        await this.userGroupDescriptionRepo.create({
          usergroup_id: newUserGroup.usergroup_id,
          lang_code: createUserGroupsDto.lang_code,
          usergroup: createUserGroupsDto.description,
        });
      return { userGroup: newUserGroup, description: newUserGroupDescription };
    }
    return { userGroup: newUserGroup };
  }

  async getUserGroup(usergroup_id: number): Promise<UserGroupEntity> {
    const userGroup = await this.userGroupRepo.findOne({
      select: ['*', `${this.userGroupTable}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: 'usergroup_id',
            rootJoin: 'usergroup_id',
          },
          [Table.USER_GROUP_PRIVILEGES]: {
            fieldJoin: 'usergroup_id',
            rootJoin: 'usergroup_id',
          },
        },
      },
      where: { [`${Table.USER_GROUPS}.usergroup_id`]: usergroup_id },
    });
    return userGroup;
  }

  async fetchUserGroups(
    skip: number,
    limit: number,
  ): Promise<UserGroupEntity[]> {
    const userGroups = await this.userGroupRepo.find({
      select: ['*', `${this.userGroupTable}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: 'usergroup_id',
            rootJoin: 'usergroup_id',
          },
          [Table.USER_GROUP_PRIVILEGES]: {
            fieldJoin: 'usergroup_id',
            rootJoin: 'usergroup_id',
          },
        },
      },
      skip,
      limit,
    });
    return userGroups;
  }

  async updateUserGroup(data: UpdateUserGroupsDto): Promise<UserGroupEntity> {
    const updatedUserGroup = await this.userGroupRepo.update(
      data.usergroup_id,
      data,
    );
    return updatedUserGroup;
  }

  async deleteUserGroup(usergroup_id: number): Promise<boolean> {
    const res = await this.userGroupRepo.delete(usergroup_id);
    // if delete usergroup success, then we will delete usergroup_description
    if (res) {
      await this.userGroupDescriptionRepo.delete(usergroup_id);
    }
    return res;
  }

  async createUserGroupDescription(
    data: CreateUserGroupDescriptionDto,
  ): Promise<any> {
    const checkUserGroupDescribeExist =
      await this.userGroupDescriptionRepo.findOne({
        where: {
          usergroup_id: data.usergroup_id,
          lang_code: data.lang_code,
          usergroup: data.usergroup,
        },
      });

    if (checkUserGroupDescribeExist) {
      throw new HttpException(
        'User Group Description đã tồn tại.',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userGroupDescriptionRepo.create({
      usergroup_id: data.usergroup_id,
      lang_code: data.lang_code,
      usergroup: data.usergroup,
    });

    const newUserGroupDescription =
      await this.userGroupDescriptionRepo.findById(data.usergroup_id);
    return { description: newUserGroupDescription };
  }

  async getUserGroupDesciption(
    usergroup_id: number,
  ): Promise<UserGroupDescriptionEntity> {
    return this.userGroupDescriptionRepo.findById(usergroup_id);
  }

  async updateUserGroupDescription(
    data: UpdateUserGroupDescriptionDto,
  ): Promise<UserGroupDescriptionEntity> {
    return this.userGroupDescriptionRepo.update(data.usergroup_id, data);
  }

  async deleteUserGroupDescription(usergroup_id: number): Promise<boolean> {
    return this.userGroupDescriptionRepo.delete(usergroup_id);
  }

  async createUserGroupLink(
    data: CreateUserGroupLinkDto,
  ): Promise<UserGroupLinkEntity> {
    const checkUserIdExists: UserGroupLinkEntity =
      await this.userGroupLinksRepo.findOne({
        where: { user_id: data.user_id },
      });
    //If user_id has been existing in ddv_usergroup_links, we need update with new data
    if (checkUserIdExists) {
      return this.userGroupLinksRepo.update(checkUserIdExists.link_id, data);
    }
    const newUserGroupId = await this.userGroupLinksRepo.create(data);
    return newUserGroupId;
  }

  async getUserInUserGroupLink(user_id: number): Promise<any> {
    const user = await this.userGroupLinksRepo.findOne({
      select: ['*', `${Table.USERS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USERS]: {
            fieldJoin: `${Table.USERS}.user_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_DATA]: {
            fieldJoin: `${Table.USER_DATA}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_PRIVILEGES]: {
            fieldJoin: `${Table.USER_GROUP_PRIVILEGES}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
        },
      },
      where: { [`${this.userGroupLinksTable}.user_id`]: user_id },
    });
    return user;
  }

  async updateUserGroupLink(
    data: UpdateUserGroupLinkDto,
  ): Promise<UserGroupLinkEntity> {
    const userGroupLink: UserGroupLinkEntity =
      await this.userGroupLinksRepo.findOne({ user_id: data.user_id });
    if (!userGroupLink) {
      throw new HttpException(
        'Không tìm thấy người dùng.',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedUserGroupLink = await this.userGroupLinksRepo.update(
      userGroupLink.link_id,
      data,
    );
    return updatedUserGroupLink;
  }

  async getUsersByUserGroupInUserGroupLink(
    usergroup_id: number,
    skip: number = 0,
    limit: number = 5,
  ): Promise<any[]> {
    const users = await this.userGroupLinksRepo.find({
      select: ['*', `${Table.USER_GROUP_LINKS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USERS]: {
            fieldJoin: `${Table.USERS}.user_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_DATA]: {
            fieldJoin: `${Table.USER_DATA}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_PRIVILEGES]: {
            fieldJoin: `${Table.USER_GROUP_PRIVILEGES}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
        },
      },
      where: { [`${this.userGroupLinksTable}.usergroup_id`]: usergroup_id },
      skip,
      limit,
    });
    return users;
  }

  async createUserGroupPrivilege(
    data: CreateUserGroupPrivilegeDto,
  ): Promise<UserGroupPrivilegeEntity> {
    const newUserGroupPrivilege = await this.userGroupPrivilegeRepo.create(
      data,
    );
    return newUserGroupPrivilege;
  }

  async updateUserGroupPrivilege(
    data: UpdateUserGroupPrivilegeDto,
  ): Promise<UserGroupPrivilegeEntity> {
    const updatedGroupPrivilege = await this.userGroupPrivilegeRepo.update(
      data.privilege_id,
      data,
    );
    return updatedGroupPrivilege;
  }

  async deleteUserGroupPrivilege(privilege_id: number): Promise<boolean> {
    return this.userGroupPrivilegeRepo.delete({ privilege_id });
  }
}
