import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from './mail.service';
import { UserRepository } from '../repositories/user.repository';
import { Table } from '../../database/enums/index';
import {
  convertNullDatetimeData,
  convertToMySQLDateTime,
  preprocessUserResult,
} from '../../utils/helper';
import { ObjectLiteral } from '../../common/ObjectLiteral';

import { PrimaryKeys } from '../../database/enums/autoIncrementKeys.enum';
import { saltHashPassword } from '../../utils/cipherHelper';

import { HttpException, HttpStatus } from '@nestjs/common';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdateUserProfileDto } from '../dto/user/update-userProfile.dto';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserDataEntity } from '../entities/userData.entity';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { LimitOnUpdateNotSupportedError } from 'typeorm';
import { userJoiner } from 'src/utils/joinTable';
import { itgCustomerToAppcore } from 'src/utils/integrateFunctions';
import { CREATE_CUSTOMER_API } from 'src/database/constant/api.appcore';
import axios from 'axios';

@Injectable()
export class UsersService {
  private table: Table = Table.USERS;
  constructor(
    private readonly mailService: MailService,
    private userDataRepository: UserDataRepository<UserDataEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private imageLinksRepository: ImagesLinksRepository<ImagesLinksEntity>,
    private imagesRepository: ImagesRepository<ImagesEntity>,
  ) {}

  async createUser(registerData): Promise<UserEntity> {
    const checkUserExists = await this.userRepository.findOne({
      where: [{ email: registerData.email }, { phone: registerData.phone }],
    });

    if (checkUserExists) {
      throw new HttpException(
        'Số điện thoại hoặc email đã được sử dụng.',
        HttpStatus.BAD_REQUEST,
      );
    }
    let user = await this.userRepository.create(registerData);
    return user;
  }

  async create(dataObj: ObjectLiteral): Promise<UserEntity> {
    let user = await this.userRepository.create(dataObj);
    return user;
  }

  async getById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.STORE_LOCATIONS]: {
            fieldJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
            rootJoin: `${Table.USERS}.store_id`,
          },
          [Table.STORE_LOCATION_DESCRIPTIONS]: {
            fieldJoin: `${Table.STORE_LOCATION_DESCRIPTIONS}.store_location_id`,
            rootJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
          },
        },
      },
      where: { [`${Table.USERS}.user_id`]: id },
    });

    console.log(user);
    if (!user) {
      throw new HttpException(
        'Người dùng không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }
    user['image'] = await this.getUserImage(user.user_id);
    return preprocessUserResult(user);
  }

  async createUserProfile(data: any): Promise<UserProfileEntity> {
    return this.userProfileRepository.create(data);
  }

  async createUserData(data: UserDataEntity): Promise<UserDataEntity> {
    return this.userDataRepository.create(data);
  }

  async updateProfile(
    user_id: number,
    data: UpdateUserProfileDto,
  ): Promise<void> {
    let user = await this.userRepository.findOne({ user_id });

    if (!user) {
      throw new HttpException('Không tìm thấy thông tin người dùng', 404);
    }

    if (data.email && user['email']) {
      throw new HttpException('Tài khoản đã có email, không thể thay đổi', 401);
    }

    const userData = {
      ...this.userRepository.setData(data),
      updated_at: convertToMySQLDateTime(),
    };
    await this.userRepository.update({ user_id }, userData);

    const userProfile = await this.userProfileRepository.findOne({ user_id });
    if (userProfile) {
      const userProfileData = this.userProfileRepository.setData(data);
      if (!Object.entries(userProfileData).length) {
        return;
      }
      await await this.userProfileRepository.update(
        { user_id },
        userProfileData,
      );
    } else {
      const newUserProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepository.setData(data),
        user_id,
      };
      await this.userProfileRepository.createSync(newUserProfileData);
    }

    user = await this.userRepository.findOne({
      select: '*',
      join: userJoiner,
      where: { [`${Table.USERS}.user_id`]: user_id },
    });

    const userDataToAppcore = itgCustomerToAppcore(user);

    await axios({
      url: `${CREATE_CUSTOMER_API}/${user.user_appcore_id}`,
      method: 'PUT',
      data: userDataToAppcore,
    });
  }

  async update(user_id: number, dataObj: ObjectLiteral): Promise<UserEntity> {
    const updatedUser = await this.userRepository.update(user_id, {
      ...dataObj,
      updated_at: convertToMySQLDateTime(),
    });
    updatedUser['image'] = await this.getUserImage(updatedUser.user_id);
    return preprocessUserResult(updatedUser);
  }

  async findOne(dataObj: ObjectLiteral | ObjectLiteral[]): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ ...dataObj });
    return user;
  }

  async findUserAllInfo(condition: any): Promise<any> {
    const users = this.findOne({
      select: [
        `${Table.USERS}.user_id`,
        `${Table.USERS}.status`,
        'user_type',
        'last_login',
        'firstname',
        'lastname',
        'password',
        'salt',
        'email',
        'phone',
        'birthday',
        'last_passwords',
        'password_change_timestamp',
        `${Table.USER_GROUP_LINKS}.usergroup_id`,
        'usergroup',
      ],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
          [Table.USER_GROUP_DESCRIPTIONS]: {
            fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
          },
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_DATA]: {
            fieldJoin: `${Table.USER_DATA}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
        },
      },

      where: { ...condition },
    });
    return users;
  }

  async findUsersAllInfo(condition: any, limit = 30): Promise<any> {
    const users = await this.userRepository.find({
      select: ['*', `${Table.USERS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_GROUP_LINKS]: {
            fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
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
        },
      },
      limit: limit,
      where: { ...condition },
    });
    return preprocessUserResult(users);
  }
  async getUserImage(user_id: number): Promise<ImagesEntity> {
    const imageLink = await this.imageLinksRepository.findOne({
      object_id: user_id,
      object_type: ImageObjectType.USER,
    });
    console.log(imageLink);
    if (imageLink) {
      const image = await this.imagesRepository.findOne({
        image_id: imageLink.image_id,
      });
      return image;
    }
    return null;
  }

  async resetPasswordByEmail(
    originUrl: string,
    email: string,
  ): Promise<boolean> {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new HttpException(
        'Người dùng không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    const verifyToken = uuidv4();

    const updatedUser = await this.userRepository.update(user.user_id, {
      verify_token: verifyToken,
      verify_token_exp: convertToMySQLDateTime(
        new Date(Date.now() + 2 * 3600 * 1000),
      ),
      updated_at: convertToMySQLDateTime(),
    });

    await this.mailService.sendUserConfirmation(
      originUrl,
      updatedUser,
      verifyToken,
    );
    return true;
  }

  async getInfo(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      select: ['*', `${this.table}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${this.table}.user_id`,
          },
        },
      },
      where: { [`${this.table}.${PrimaryKeys[this.table]}`]: id },
    });
    user['image'] = await this.getUserImage(user.user_id);
    return preprocessUserResult(user);
  }

  async restorePasswordByEmail(
    user_id: string,
    token: string,
  ): Promise<UserEntity> {
    const checkUser: any = await this.userRepository.findOne({
      where: { user_id, verify_token: token },
    });

    if (!checkUser) {
      throw new HttpException(
        'Người dùng không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (new Date(checkUser.verify_token_exp).getTime() < new Date().getTime()) {
      throw new HttpException('Token hết hạn.', HttpStatus.GATEWAY_TIMEOUT);
    }
    return checkUser;
  }

  async updatePasswordByEmail(
    user_id: number,
    token: string,
    newPassword: string,
  ): Promise<boolean> {
    const user: any = await this.userRepository.findOne({
      where: {
        user_id,
        verify_token: token,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (new Date(user.verify_token_exp).getTime() < new Date().getTime()) {
      throw new HttpException(
        'Token đã hết hiệu lực, cập nhật thất bại.',
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    const { passwordHash, salt } = saltHashPassword(newPassword);

    await this.userRepository.update(user_id, {
      password: passwordHash,
      salt,
      verify_token: '',
      updated_at: convertToMySQLDateTime(),
    });
    return true;
  }

  async updateUserOTP(user_id: number, otp: number): Promise<UserEntity> {
    const updatedUser = this.userRepository.update(user_id, {
      otp,
      otp_incorrect_times: 0,
    });
    return updatedUser;
  }

  async updateProfilebyAdmin(id, data) {
    let userData = {
      ...this.userRepository.setData(data),
      updated_at: convertToMySQLDateTime(),
    };
    let _user = await this.userRepository.update(id, userData);
    let result = { ..._user };
    const userProfile = {
      ...this.userProfileRepository.setData(data),
    };
    const _userProfile = await this.userProfileRepository.update(
      id,
      userProfile,
    );
    result = { ...result, ..._userProfile };
    return result;
  }
}
