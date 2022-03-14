import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import { Table, JoinTable } from '../../database/enums/index';

import { UsersService } from './users.service';
import { UpdateCustomerDTO } from '../dto/customer/update-customer.dto';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { userJoiner } from 'src/utils/joinTable';
import { customersListSearchFilter } from 'src/utils/tableConditioner';
import { Like } from 'src/database/find-options/operators';
import { customer_type } from '../../database/constant/customer';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import {
  convertNullDatetimeData,
  generateRandomPassword,
  preprocessUserResult,
} from 'src/utils/helper';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { convertToMySQLDateTime } from '../../utils/helper';
import { saltHashPassword } from 'src/utils/cipherHelper';
import { MailService } from './mail.service';
import axios from 'axios';
import { itgCustomerFromAppcore } from 'src/utils/integrateFunctions';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserDataEntity } from '../entities/userData.entity';
import { UpdateCustomerAppcoreDto } from '../dto/customer/update-customerAppcore.dto';
import {
  UserStatusEnum,
  UserTypeEnum,
} from 'src/database/enums/tableFieldEnum/user.enum';
import { CreateCustomerAppcoreDto } from '../dto/customer/crate-customerAppcore.dto';

@Injectable()
export class CustomerService {
  constructor(
    private usersService: UsersService,
    private userRepo: UserRepository<UserEntity>,
    private userProfileRepo: UserProfileRepository<UserProfileEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private userLoyalRepo: UserLoyaltyRepository<UserLoyaltyEntity>,
    private userDataRepo: UserDataRepository<UserDataEntity>,
  ) {}

  async getList(params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.userRepo.tableProps.includes(key)) {
          filterConditions[`${Table.USERS}.${key}`] = Like(val);
          continue;
        }
        if (this.userProfileRepo.tableProps.includes(key)) {
          filterConditions[`${Table.USER_PROFILES}.${key}`] = Like(val);
          continue;
        }
      }
    }

    const count = await this.userRepo.find({
      select: [`COUNT(DISTINCT(${Table.USERS}.user_id)) as total`],
      join: userJoiner,
      where: customersListSearchFilter(search, filterConditions),
    });

    let customersList = await this.userRepo.find({
      select: ['*'],
      join: userJoiner,
      where: customersListSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    return {
      customers: customersList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : 0,
      },
    };
  }

  async getById(id) {
    const user = await this.userRepo.findOne({
      select: ['*'],
      join: userJoiner,
      where: {
        [`${Table.USERS}.user_id`]: id,
      },
    });
    if (!user) {
      throw new HttpException('Không tìm thấy customer', 404);
    }

    if (user.user_type !== UserTypeEnum.Customer) {
      throw new HttpException('Người dùng không phải là khách hàng.', 409);
    }

    const userImage = await this.imageLinkRepo.findOne({
      object_id: id,
      object_type: ImageObjectType.USER,
    });
    if (userImage) {
      const avatar = await this.imageRepo.findById(userImage.image_id);
      user['avatar'] = avatar;
    }
    return preprocessUserResult(user);
  }

  async update(user_id: string, data: UpdateCustomerDTO) {
    const user = await this.userRepo.findOne({ user_id });
    if (!user) {
      throw new HttpException('Không tìm thấy người dùng.', 404);
    }
    let result = { ...user };
    const userData = this.userRepo.setData(data);
    if (Object.entries(userData).length) {
      const updatedUser = await this.userRepo.update({ user_id }, userData);
      result = { ...result, ...updatedUser };
    }

    const userProfileData = this.userProfileRepo.setData(data);
    if (Object.entries(userProfileData).length) {
      const updatedUserProfile = await this.userProfileRepo.update(
        { user_id: result.user_id },
        userProfileData,
      );
      result = { ...result, profile: updatedUserProfile };
    }

    if (data.loyalty_point) {
      const userLoyal = await this.userRepo.findOne({ user_id: user.user_id });
      if (!userLoyal) {
        const newUserLoyal = await this.userLoyalRepo.create({
          user_id: user.user_id,
          loyalty_point: data.loyalty_point,
          created_at: convertToMySQLDateTime(),
          updated_at: convertToMySQLDateTime(),
        });
        result['loyalty'] = newUserLoyal;
      } else {
        const updatedUserLoyal = await this.userLoyalRepo.update(
          {
            user_id: user.user_id,
          },
          {
            loyalty_point: data.loyalty_point,
            updated_at: convertToMySQLDateTime(),
          },
        );
        result['loyalty'] = updatedUserLoyal;
      }
    }
  }

  async itgGet() {
    try {
      const response = await axios({
        url: 'http://mb.viendidong.com/core-api/v1/customers?page=5',
      });
      const randomPassword = generateRandomPassword();
      const { passwordHash, salt } = saltHashPassword(randomPassword);
      const users = response.data.data;
      let logsUserExist = [];
      for (let userItem of users) {
        const itgUser = itgCustomerFromAppcore(userItem);

        const checkUserExist = await this.userRepo.findOne({
          user_appcore_id: userItem.id,
        });
        if (checkUserExist) {
          logsUserExist.push(userItem.id);
          continue;
        }

        const userData = {
          ...new UserEntity(),
          ...this.userRepo.setData(itgUser),
          password: passwordHash,
          salt: salt,
          user_type: UserTypeEnum.Customer,
          status: UserStatusEnum.Deactive,
        };

        const newUser = await this.userRepo.create(userData);

        let result = { ...newUser };

        const userProfileData = {
          ...new UserProfileEntity(),
          ...this.userProfileRepo.setData(itgUser),
          user_id: result.user_id,
        };

        const newUserProfile = await this.userProfileRepo.create(
          userProfileData,
        );

        result = { ...result, profile: newUserProfile };

        // user_data
        let _data = itgUser;
        const userDataData = {
          ...new UserDataEntity(),
          ...this.userDataRepo.setData(itgUser),
          user_id: result.user_id,
        };

        const newUserData = await this.userDataRepo.create(userDataData);

        result = { ...result, data: newUserData };

        const userLoyaltyData = {
          ...new UserLoyaltyEntity(),
          ...this.userLoyalRepo.setData(itgUser),
          user_id: result.user_id,
        };

        const newUserLoyalty = await this.userLoyalRepo.create(userLoyaltyData);

        result = { ...result, loyalty: newUserLoyalty };
      }

      return logsUserExist;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Có lỗi xảy ra : ${error.response.data.message}`,
        error.response.status_code,
      );
    }
  }

  async itgCreate(data: CreateCustomerAppcoreDto) {
    const randomPassword = generateRandomPassword();
    const { passwordHash, salt } = saltHashPassword(randomPassword);

    const user = await this.userRepo.findOne({ phone: data.phone });
    if (user) {
      throw new HttpException('Số điện thoại này đã có trong hệ thống', 409);
    }

    const userAppcore = await this.userRepo.findOne({
      user_appcore_id: data.user_appcore_id,
    });
    if (userAppcore) {
      throw new HttpException('UserAppcore đã tồn tại', 409);
    }

    if (data.email) {
      const userEmail = await this.userRepo.findOne({ email: data.email });
      if (userEmail) {
        throw new HttpException('Email đã tồn tại', 409);
      }
    }

    data['birthday'] = convertNullDatetimeData(data['birthday']);
    data['created_at'] = convertNullDatetimeData(data['created_at']);
    data['updated_at'] = convertNullDatetimeData(data['updated_at']);

    const userData = {
      ...new UserEntity(),
      ...this.userRepo.setData(data),
      password: passwordHash,
      salt: salt,
      status: UserStatusEnum.Deactive,
    };

    const newUser = await this.userRepo.create(userData);

    let result = { ...newUser };

    const userProfileData = {
      ...new UserProfileEntity(),
      ...this.userProfileRepo.setData(data),
      user_id: result.user_id,
    };

    const newUserProfile = await this.userProfileRepo.create(userProfileData);

    result = { ...result, profile: newUserProfile };

    const userDataData = {
      ...new UserDataEntity(),
      ...this.userDataRepo.setData(data),
      user_id: result.user_id,
    };

    const newUserData = await this.userDataRepo.create(userDataData);

    result = { ...result, data: newUserData };

    const userLoyaltyData = {
      ...new UserLoyaltyEntity(),
      ...this.userLoyalRepo.setData(data),
      user_id: result.user_id,
    };

    const newUserLoyalty = await this.userLoyalRepo.create(userLoyaltyData);

    result = { ...result, loyalty: newUserLoyalty };

    if (data['image_path']) {
      const customerImage = await this.imageRepo.create({
        image_path: data['image_path'],
      });
      if (customerImage) {
        const customerImageLink = await this.imageLinkRepo.create({
          object_id: result.user_id,
          object_type: ImageObjectType.USER,
          image_id: customerImage.image_id,
        });

        result = {
          ...result,
          avatar: { ...customerImage, ...customerImageLink },
        };
      }
    }

    return result;
  }

  async itgUpdate(user_appcore_id: number, data: UpdateCustomerAppcoreDto) {
    const user = await this.userRepo.findOne({
      user_appcore_id,
    });

    if (!user) {
      throw new HttpException('Không tìm thấy user trong hệ thống.', 404);
    }

    if (data.email && user.email !== data.email) {
      const userEmail = await this.userRepo.findOne({ email: data.email });
      if (userEmail) {
        throw new HttpException('Email đã tồn tại', 409);
      }
    }

    let result = { ...user };

    data['birthday'] = convertNullDatetimeData(data['birthday']);
    data['created_at'] = convertNullDatetimeData(data['created_at']);
    data['updated_at'] = convertNullDatetimeData(data['updated_at']);

    const userData = this.userRepo.setData(data);

    if (Object.entries(userData).length) {
      const updatedUser = await this.userRepo.update(
        { user_id: result.user_id },
        userData,
      );
      result = { ...updatedUser };
    }

    const userProfileData = this.userProfileRepo.setData(data);
    if (Object.entries(userProfileData).length) {
      const updatedUserProfile = await this.userProfileRepo.update(
        { user_id: result.user_id },
        userProfileData,
      );
      result = { ...result, ...updatedUserProfile };
    }

    const userDataData = this.userDataRepo.setData(data);

    if (Object.entries(userDataData).length) {
      const updatedUserData = await this.userDataRepo.update(
        { user_id: result.user_id },
        userDataData,
      );
      result = { ...result, ...updatedUserData };
    }

    const userLoyaltyData = this.userLoyalRepo.setData(data);

    if (Object.entries(userLoyaltyData).length) {
      const updatedUserLoyalty = await this.userLoyalRepo.update(
        { user_id: result.user_id },
        userLoyaltyData,
      );
      result = { ...result, ...updatedUserLoyalty };
    }

    if (data['image_path']) {
      const oldAvatar = await this.imageLinkRepo.findOne({
        object_id: result.user_id,
        object_type: ImageObjectType.USER,
      });
      if (oldAvatar) {
        await this.imageLinkRepo.delete({ pair_id: oldAvatar.pair_id });
        await this.imageRepo.delete({ image_id: oldAvatar.image_id });
      }

      const customerImage = await this.imageRepo.create({
        image_path: data['image_path'],
      });
      if (customerImage) {
        const customerImageLink = await this.imageLinkRepo.create({
          object_id: result.user_id,
          object_type: ImageObjectType.USER,
          image_id: customerImage.image_id,
        });

        result = {
          ...result,
          avatar: { ...customerImage, ...customerImageLink },
        };
      }
    }

    return result;
  }
}
