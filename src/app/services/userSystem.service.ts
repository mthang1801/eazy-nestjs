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
import { userSystemSearchFilter } from 'src/utils/tableConditioner';
import { UpdateUserSystemDto } from '../dto/userSystem/update-userSystem.dto';
import { userJoiner } from 'src/utils/joinTable';
import { customer_type } from '../../database/constant/customer';
import { userSystemStoreJoiner } from '../../utils/joinTable';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CreateUserSystemDto } from '../dto/userSystem/create-userSystem.dto';
import { defaultPassword } from '../../database/constant/defaultPassword';
import {
  UserStatusEnum,
  UserTypeEnum,
} from 'src/database/enums/tableFieldEnum/user.enum';
import { saltHashPassword } from 'src/utils/cipherHelper';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserDataEntity } from '../entities/userData.entity';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { CustomerService } from './customer.service';
import { convertNullDatetimeData } from 'src/utils/helper';

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
    private userDataRepo: UserDataRepository<UserDataEntity>,
    private userLoyalRepo: UserLoyaltyRepository<UserLoyaltyEntity>,
    private customerService: CustomerService,
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

    const count = await this.userRepository.find({
      select: [`COUNT(DISTINCT(${Table.USERS}.user_id)) as total`],
      join: userSystemStoreJoiner,
      where: userSystemSearchFilter(search, filterCondition),
    });

    const users = await this.userRepository.find({
      select: ['*', `${Table.USERS}.*`],
      join: userSystemStoreJoiner,
      where: userSystemSearchFilter(search, filterCondition),
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
      join: userSystemStoreJoiner,
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

  async create(data: CreateUserSystemDto) {
    const user = await this.userRepository.findOne({
      select: '*',
      join: userJoiner,
      where: { phone: data.phone },
    });
    let result: any = {};
    if (user) {
      if (user.user_type === UserTypeEnum.Employee) {
        throw new HttpException('Người dùng này đã nằm trong hệ thống', 400);
      }
      await this.userRepository.update(
        { user_id: user.user_id },
        { user_type: UserTypeEnum.Employee, store_id: data.store_id },
      );
      result = { ...user };
    } else {
      const { passwordHash, salt } = saltHashPassword(defaultPassword);

      const userData = {
        ...new UserEntity(),
        ...this.userRepository.setData(data),
        password: passwordHash,
        salt: salt,
        status: UserStatusEnum.Active,
        user_type: UserTypeEnum.Employee,
        store_id: data.store_id,
      };
      userData['birthday'] = convertNullDatetimeData(userData['birthday']);
      const newUser = await this.userRepository.create(userData);

      result = { ...newUser };

      const userProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepository.setData(data),
        user_id: result.user_id,
      };

      const newUserProfile = await this.userProfileRepository.create(
        userProfileData,
      );

      result = { ...result, ...newUserProfile };

      const userDataData = {
        ...new UserDataEntity(),
        ...this.userDataRepo.setData(data),
        user_id: result.user_id,
      };

      const newUserData = await this.userDataRepo.create(userDataData);

      result = { ...result, ...newUserData };

      const userLoyaltyData = {
        ...new UserLoyaltyEntity(),
        ...this.userLoyalRepo.setData(data),
        user_id: result.user_id,
      };

      const newUserLoyalty = await this.userLoyalRepo.create(userLoyaltyData);

      result = { ...result, ...newUserLoyalty };

      await this.customerService.createCustomerToAppcore(result);
    }

    await this.userGroupLinksRepo.create({
      usergroup_id: data.usergroup_id,
      user_id: result.user_id,
    });
  }
}
