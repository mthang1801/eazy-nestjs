import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UserDataEntity, UserEntity } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from './mail.service';
import { UserRepository } from '../repositories/user.repository';
import { Table } from '../../database/enums/index';
import {
  convertToMySQLDateTime,
  preprocessUserResult,
} from '../../utils/helper';
import { BaseService } from '../../base/base.service';
import { ObjectLiteral } from '../../common/ObjectLiteral';
import { UserProfileEntity } from '../entities/user.entity';
import { PrimaryKeys } from '../../database/enums/primary-keys.enum';
import { saltHashPassword } from '../../utils/cipherHelper';

import { HttpException, HttpStatus } from '@nestjs/common';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserProfileDto } from '../dto/user/update-user-profile.dto';
import {
  ImagesLinksRepository,
  ImagesRepository,
} from '../repositories/image.repository';
import { ImagesLinksEntity, ImagesEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/image_types.enum';
import {
  UserGroupStatusEnum,
  UserGroupTypeEnum,
} from 'src/database/enums/tableFieldEnum/user_groups.enum';
import { UserGroupEntity, UserGroupLinkEntity } from '../entities/user_groups';
import {
  UserGroupLinksRepository,
  UserGroupsRepository,
} from '../repositories/user_groups.repository';
import { UserDataRepository } from '../repositories/user-data.repository';
import { UserProfileRepository } from '../repositories/user-profile.repository';

@Injectable()
export class UsersService {
  private table: Table = Table.USERS;
  constructor(
    private readonly mailService: MailService,
    private userGroupLinkRepository: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userGroupRepository: UserGroupsRepository<UserGroupEntity>,
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

  async findById(id: number): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.findOne({ user_id: id });
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

  async updateUser(
    user_id: number,
    dataObj: ObjectLiteral,
  ): Promise<UserEntity> {
    const updatedUser = await this.userRepository.update(user_id, dataObj);
    updatedUser['image'] = await this.getUserImage(updatedUser.user_id);
    return preprocessUserResult(updatedUser);
  }

  async findOne(dataObj: ObjectLiteral | ObjectLiteral[]): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ ...dataObj });
    return user;
  }

  async findUserAllInfo(condition: any): Promise<any> {
    return this.findOne({
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
      where: { ...condition },
    });
  }

  async getUserImage(user_id: number): Promise<ImagesEntity> {
    const imageLinks = await this.imageLinksRepository.findOne({
      object_id: user_id,
      object_type: ImageObjectType.USER,
    });
    if (imageLinks) {
      const image = await this.imagesRepository.findById(imageLinks.image_id);
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

    try {
      const verifyToken = uuidv4();

      const updatedUser = await this.userRepository.update(user.user_id, {
        verify_token: verifyToken,
        verify_token_exp: convertToMySQLDateTime(
          new Date(Date.now() + 2 * 3600 * 1000),
        ),
      });

      await this.mailService.sendUserConfirmation(
        originUrl,
        updatedUser,
        verifyToken,
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async getMyInfo(id: string): Promise<UserEntity> {
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

  async restorePasswordByOTP(user_id: number, otp: number): Promise<boolean> {
    const user = await this.userRepository.findById(user_id);

    if (user.otp_incorrect_times > 2) {
      throw new BadRequestException('Số lần nhập mã OTP vượt quá giới hạn');
    }
    if (user.otp !== otp) {
      const otp_incorrect_times = user.otp_incorrect_times + 1;
      await this.userRepository.update(user.user_id, {
        otp_incorrect_times,
      });

      throw new BadRequestException('OTP không chính xác');
    }
    return true;
  }

  async updateProfile(
    id: number,
    userProfileDto: UserProfileDto,
  ): Promise<UserProfileEntity> {
    const updatedProfile = await this.userProfileRepository.update(
      id,
      userProfileDto,
    );
    updatedProfile['image'] = await this.getUserImage(updatedProfile.user_id);
    return updatedProfile;
  }
}
