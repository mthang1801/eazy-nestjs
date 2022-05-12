import { HttpException, Injectable } from '@nestjs/common';
import { UpdateUserGroupsDto } from '../dto/usergroups/update-usergroups.dto';
import { FunctEntity } from '../entities/funct.entity';
import { UserEntity } from '../entities/user.entity';
import { UserGroupDescriptionEntity } from '../entities/userGroupDescription.entity';
import { UserRoleEntity } from '../entities/userRole.entity';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { FunctRepository } from '../repositories/funct.repository';
import { UserRepository } from '../repositories/user.repository';

import { UserRoleRepository } from '../repositories/userRole.repository';
import { RoleFunctionRepository } from '../repositories/roleFunction.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { Table } from '../../database/enums/tables.enum';
import { Like, Not, Equal, In } from '../../database/operators/operators';
import { userSystemSearchFilter } from 'src/utils/tableConditioner';
import { UpdateUserSystemDto } from '../dto/userSystem/update-userSystem.dto';
import { userJoiner } from 'src/utils/joinTable';
import { customer_type } from '../../constants/customer';
import { userSystemStoreJoiner, userRoleJoiner } from '../../utils/joinTable';
import { SortBy } from '../../database/enums/sortBy.enum';
import { CreateUserSystemDto } from '../dto/userSystem/create-userSystem.dto';
import { defaultPassword } from '../../constants/defaultPassword';
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
import {
  convertNullDatetimeData,
  formatStandardTimeStamp,
} from 'src/utils/helper';
import { getUserSystemByIdSelector } from 'src/utils/tableSelector';
import * as moment from 'moment';
import { UpdateUserSystemRoleFunctsDto } from '../dto/userSystem/update-userSystemRoleFuncts.dto';

@Injectable()
export class UserSystemService {
  constructor(
    private roleRepo: RoleRepository<RoleEntity>,
    private userRoleRepo: UserRoleRepository<UserRoleEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private roleFunctRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private functRepo: FunctRepository<FunctEntity>,
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
      orderBy: [
        { field: `${Table.USERS}.updated_at`, sortBy: SortBy.DESC },
        { field: `${Table.USERS}.created_at`, sortBy: SortBy.DESC },
      ],
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
      select: getUserSystemByIdSelector,
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

  async update(user_id: number, data: UpdateUserSystemDto): Promise<any> {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new HttpException('Người dùng không tồn tại trong hệ thống.', 404);
    }

    const groupRole = await this.roleRepo.findOne({
      role_id: data.role_id,
      status: 'A',
    });
    if (!groupRole) {
      throw new HttpException(
        'Không tìm thấy nhóm người dùng hoặc đã bị vô hiệu hoá.',
        404,
      );
    }

    const userUpdateData = this.userRepository.setData(data);
    if (data.password) {
      const { passwordHash, salt } = saltHashPassword(data.password);
      userUpdateData['password'] = passwordHash;
      userUpdateData['salt'] = salt;
    }

    let result: any = { ...user };
    if (Object.entries(userUpdateData).length) {
      const updatedUser = await this.userRepository.update(
        { user_id: result.user_id },
        { ...userUpdateData, updated_at: formatStandardTimeStamp() },
      );

      result = { ...result, ...updatedUser };
    }

    if (data.role_id) {
      const currentRoleOfUser = await this.userRoleRepo.findOne({
        select: '*',
        join: userRoleJoiner,
        where: { [`${Table.USER_ROLES}.user_id`]: user_id },
      });
      if (currentRoleOfUser && currentRoleOfUser.role_id === data.role_id) {
        return;
      }
      if (currentRoleOfUser) {
        await this.userRoleRepo.delete({ user_id });
      }
      const groupRoleFuncts = await this.roleFunctRepo.find({
        role_id: data.role_id,
      });
      if (groupRoleFuncts.length) {
        for (let groupRoleFunctItem of groupRoleFuncts) {
          await this.userRoleRepo.create({
            user_id,
            role_funct_id: groupRoleFunctItem.role_funct_id,
          });
        }
      }
    }
  }

  async create(data: CreateUserSystemDto) {
    const user = await this.userRepository.findOne({
      select: '*',
      join: userJoiner,
      where: { phone: data.phone },
    });

    if (data.email) {
      const checkUserEmailExist = await this.userRepository.findOne({
        email: data.email,
      });
      if (checkUserEmailExist) {
        throw new HttpException('Email đã tồn tại', 409);
      }
    }

    const groupRole = await this.roleRepo.findOne({
      role_id: data.role_id,
      status: 'A',
    });
    if (!groupRole) {
      throw new HttpException(
        'Không tìm thấy nhóm người dùng hoặc đã bị vô hiệu hoá.',
        404,
      );
    }

    let result: any = {};

    let userProfile = {};
    if (data.firstname) {
      userProfile['b_firstname'] = data.firstname;
      userProfile['s_firstname'] = data.firstname;
    }
    if (data.lastname) {
      userProfile['s_lastname'] = data.lastname;
      userProfile['s_lastname'] = data.lastname;
    }
    if (data.phone) {
      userProfile['b_phone'] = data.phone;
      userProfile['s_phone'] = data.phone;
    }

    if (user) {
      if (user.user_type === UserTypeEnum.Employee) {
        throw new HttpException('Người dùng này đã nằm trong hệ thống', 400);
      }
      let userData = this.userRepository.setData(data);
      if (data.email && !user.email) {
        userData['email'] = data.email;
      }

      if (data.phone && !user.phone) {
        userData['phone'] = data.phone;
      }
      let result = await this.userRepository.update(
        { user_id: user.user_id },
        {
          ...userData,
          user_type: UserTypeEnum.Employee,
          store_id: data.store_id,
          status: data.status,
          updated_at: formatStandardTimeStamp(),
          lastname: data.lastname,
        },
        true,
      );
      let userProfile = await this.userProfileRepository.findOne({
        user_id: user.user_id,
      });

      if (!userProfile) {
        const newUserPrtofileData = {
          ...new UserProfileEntity(),
          ...userProfile,
          b_phone: data.phone,
          user_id: user.user_id,
          b_lastname: data.lastname,
        };
        userProfile = await this.userProfileRepository.create(
          newUserPrtofileData,
        );
      } else {
        const updatedUserProfile = {
          b_lastname: data.lastname,
          b_phone: data.phone,
        };
        userProfile = await this.userProfileRepository.update(
          { user_id: user.user_id },
          updatedUserProfile,
          true,
        );
      }
      result = { ...result, ...userProfile };
      await this.customerService.updateCustomerToAppcore(result);
    } else {
      const { passwordHash, salt } = saltHashPassword(data.password);

      const userData = {
        ...new UserEntity(),
        ...this.userRepository.setData(data),
        password: passwordHash,
        salt: salt,
        status: data.status,
        user_type: UserTypeEnum.Employee,
        store_id: data.store_id,
      };
      if (data['birthday'] && moment(data['birthday']).isValid()) {
        userData['birthday'] = formatStandardTimeStamp(userData['birthday']);
      }

      const newUser = await this.userRepository.create(userData);

      result = { ...newUser };

      const userProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepository.setData(data),
        b_lastname: data.lastname,
        b_phone: data.phone,
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

      await this.userDataRepo.create(userDataData, false);

      const userLoyaltyData = {
        ...new UserLoyaltyEntity(),
        ...this.userLoyalRepo.setData(data),
        user_id: result.user_id,
      };

      await this.userLoyalRepo.create(userLoyaltyData, false);

      await this.customerService.createCustomerToAppcore(result);

      const groupRoleFuncts = await this.roleFunctRepo.find({
        role_id: data.role_id,
      });
      if (groupRoleFuncts.length) {
        for (let groupRoleFunctItem of groupRoleFuncts) {
          await this.userRoleRepo.create({
            user_id: result.user_id,
            role_funct_id: groupRoleFunctItem.role_funct_id,
          });
        }
      }
    }
  }

  async changeRoleFuncts(user_id: number, data: UpdateUserSystemRoleFunctsDto) {
    if (data.role_funct_ids && data.role_funct_ids.length) {
      const groupRoles = await this.roleFunctRepo.find({
        role_funct_id: In(data.role_funct_ids),
      });

      if ([...new Set(groupRoles.map(({ role_id }) => role_id))].length > 1) {
        throw new HttpException('Không hợp lệ.', 400);
      }

      await this.userRoleRepo.delete({ user_id });
      for (let roleFuncId of data.role_funct_ids) {
        await this.userRoleRepo.create(
          { user_id, role_funct_id: roleFuncId },
          false,
        );
      }
    }
  }
}
