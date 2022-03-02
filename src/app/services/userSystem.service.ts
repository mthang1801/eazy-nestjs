import { HttpException, Injectable } from '@nestjs/common';
import { UpdateUserGroupsDto } from '../dto/usergroups/update-usergroups.dto';
import { PrivilegeEntity } from '../entities/privilege.entity';
import { UserEntity } from '../entities/user.entity';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { UserGroupLinkEntity } from '../entities/usergroupLinks.entity';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';
import { UserGroupEntity } from '../entities/usergroups.entity';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { PrivilegeRepository } from '../repositories/privilege.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserGroupDescriptionsRepository } from '../repositories/usergroupDescriptions.repository';
import { UserGroupLinksRepository } from '../repositories/usergroupLinks.repository';
import { UserGroupPrivilegesRepository } from '../repositories/usergroupPrivileges.repository';
import { UserGroupsRepository } from '../repositories/usergroups.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { Table } from '../../database/enums/tables.enum';
import { Like, Not, Equal } from '../../database/find-options/operators';
import { JoinTable } from 'src/database/enums';
import { userSearchByNameEmailPhone } from 'src/utils/tableConditioner';
import { UpdateUserSystemDto } from '../dto/userSystem/update-userSystem.dto';
import { userJoiner } from 'src/utils/joinTable';
import { customer_type } from '../../database/constant/customer';
import { userSystemStoreJoiner } from '../../utils/joinTable';
import { SortBy } from '../../database/enums/sortBy.enum';

@Injectable()
export class UserSystemService {
  constructor(
    private userGroupRepo: UserGroupsRepository<UserGroupEntity>,
    private userGroupDescriptionRepo: UserGroupDescriptionsRepository<UserGroupDescriptionEntity>,
    private userGroupLinksRepo: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userGroupPrivilegeRepo: UserGroupPrivilegesRepository<UserGroupPrivilegeEntity>,
    private privilegeRepo: PrivilegeRepository<PrivilegeEntity>,
  ) {}

  async getUserLists(params): Promise<any> {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 10;

    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.userRepository.tableProps.includes(key)) {
          if (key === 'status') {
            filterCondition[`${Table.USERS}.${key}`] = val;
            continue;
          }
          filterCondition[`${Table.USERS}.${key}`] = Like(val);
          continue;
        }

        if (this.userGroupRepo.tableProps.includes(key)) {
          filterCondition[`${Table.USER_GROUPS}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.USER_GROUP_DESCRIPTIONS}.${key}`] =
            Like(val);
        }
      }
    }

    // Chắc chắn răng người dùng hiện tại không phải là Customer
    filterCondition[`${Table.USERS}.store_id`] = Not(Equal(0));

    const count = await this.userRepository.find({
      select: [`COUNT(DISTINCT(${Table.USERS}.user_id)) as total`],
      join: userSystemStoreJoiner,
      where: search
        ? userSearchByNameEmailPhone(search, filterCondition)
        : filterCondition,
    });

    const users = await this.userRepository.find({
      select: ['*', `${Table.USERS}.*`],
      join: userSystemStoreJoiner,
      where: search
        ? userSearchByNameEmailPhone(search, filterCondition)
        : filterCondition,
      orderBy: [{ field: 'created_at', sortBy: SortBy.DESC }],
      skip,
      limit,
    });

    return {
      users,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count ? count[0].total : 0,
      },
    };
  }

  async getById(id): Promise<any> {
    const user = await this.userRepository.findOne({
      select: ['*'],
      join: userJoiner,
      where: {
        [`${Table.USERS}.user_id`]: id,
      },
    });

    if (!user) {
      throw new HttpException('Không tìm thấy người dùng', 404);
    }

    if (customer_type.includes(user.user_type)) {
      throw new HttpException('người dùng không phải nhân viên hệ thống', 400);
    }

    return user;
  }

  async update(id: number, data: UpdateUserSystemDto): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('Người dùng không tồn tại trong hệ thống.', 404);
    }

    const userUpdateData = this.userRepository.setData(data);
    let result: any = { ...user };
    if (Object.entries(userUpdateData).length) {
      const updatedUser = await this.userRepository.update(
        { user_id: result.user_id },
        userUpdateData,
      );

      result = { ...result, ...updatedUser };
    }

    const userGroupLinkData = this.userGroupLinksRepo.setData(data);

    if (Object.entries(userGroupLinkData).length) {
      const updatedUserGroupLink = await this.userGroupLinksRepo.update(
        { user_id: result.user_id },
        userGroupLinkData,
      );
      result = { ...result, ...updatedUserGroupLink };
    }

    return result;
  }
}
