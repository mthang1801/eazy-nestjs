import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthCredentialsDto } from '../dto/auth/auth-credential.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, UserProfileEntity } from '../entities/user.entity';
import { saltHashPassword, desaltHashPassword } from '../../utils/cipherHelper';
import { PrimaryKeys } from '../../database/enums/primary-keys.enum';
import {
  convertToMySQLDateTime,
  preprocessUserResult,
} from '../../utils/helper';
import { AuthProviderRepository } from '../repositories/auth.repository';
import { BaseService } from '../../base/base.service';
import { AuthProviderEntity } from '../entities/auth-provider.entity';
import { Table } from '../../database/enums/tables.enum';
import { IResponseUserToken } from '../interfaces/response.interface';
import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/auth_provider.enum';
import { generateOTPDigits } from '../../utils/helper';
import { AuthLoginProviderDto } from '../dto/auth/auth-login-provider.dto';
import * as twilio from 'twilio';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  UserGroupLinksRepository,
  UserGroupsRepository,
} from '../repositories/user_groups.repository';
import { UserGroupLinkEntity, UserGroupEntity } from '../entities/user_groups';
import {
  UserGroupIdEnum,
  UserGroupTypeEnum,
  UserGroupStatusEnum,
} from '../../database/enums/tableFieldEnum/user_groups.enum';
import { ImagesService } from './image.service';
import {
  ImagesLinksRepository,
  ImagesRepository,
} from '../repositories/image.repository';
import { ImagesEntity, ImagesLinksEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/image_types.enum';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserProfileRepository } from '../repositories/user.repository';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private authRepository: AuthProviderRepository<AuthProviderEntity>,
    private userGroupLinkRepository: UserGroupLinksRepository<UserGroupLinkEntity>,
    private userGroupRepository: UserGroupsRepository<UserGroupEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private imageLinksRepository: ImagesLinksRepository<ImagesLinksEntity>,
    private imagesRepository: ImagesRepository<ImagesEntity>,
  ) {}

  generateToken(user: UserEntity): string {
    const payload = {
      sub: user,
    };
    return this.jwtService.sign(payload);
  }

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<IResponseUserToken> {
    const { firstname, lastname, email, password, phone } = authCredentialsDto;
    const { passwordHash, salt } = saltHashPassword(password);

    let user = await this.userService.createUser({
      firstname,
      lastname,
      user_login: AuthProviderEnum.SYSTEM,
      email,
      password: passwordHash,
      phone,
      salt,
      created_at: convertToMySQLDateTime(),
    });
    //create a new record as customer position at ddv_usergroup_links
    const userGroupForCustomer = await this.createUserGroupLink(
      user.user_id,
      UserGroupTypeEnum.Customer,
    );
    //create a new record at ddv_user_profiles
    const newUserProfile = await this.createUserProfile({
      user_id: user.user_id,
      b_firstname: firstname,
      b_lastname: lastname,
      b_phone: phone,
    });
    user = { ...user, ...userGroupForCustomer, ...newUserProfile };

    return {
      token: this.generateToken(user),
      userData: preprocessUserResult(user),
    };
  }

  /**
   * Get all fields from ddv_usergroup_links and ddv_usergroups
   * @param user_id
   * @param position
   * @returns
   */
  async createUserGroupLink(
    user_id: number,
    position: string = UserGroupTypeEnum.Customer,
  ): Promise<any> {
    const userGroupForCustomer: UserGroupEntity =
      await this.userGroupRepository.findOne({
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
      await this.userGroupLinkRepository.create({
        user_id: user_id,
        usergroup_id: userGroupForCustomer.usergroup_id,
      });
    return { ...userGroupForCustomer, ...newUserGroupLink };
  }

  async createUserProfile(data: any): Promise<UserProfileEntity> {
    return this.userProfileRepository.create(data);
  }

  async login(data: any): Promise<IResponseUserToken> {
    const phone = data['phone'];
    const email = data['email'];
    const password = data['password'];
    const findByEmail = {
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
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
        },
      },
      where: { email },
    };

    const findByPhone = {
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
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
        },
      },
      where: { phone },
    };

    let user: UserEntity = phone
      ? await this.userService.findOne(findByPhone)
      : await this.userService.findOne(findByEmail);

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }
    if (desaltHashPassword(password, user.salt) !== user.password) {
      throw new HttpException(
        phone
          ? 'Số điện thoại hoặc mật khẩu không đúng.'
          : 'Địa chỉ email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.userService.updateUser(user.user_id, {
      user_login: AuthProviderEnum.SYSTEM,
    });

    user['image'] = await this.getUserImage(user.user_id);

    const dataResult = {
      token: this.generateToken(user),
      userData: preprocessUserResult(user),
    };

    return dataResult;
  }

  async getUserImage(user_id: number): Promise<ImagesEntity> {
    const imageLinks = await this.imageLinksRepository.findOne({
      where: {
        object_id: user_id,
        object_type: ImageObjectType.USER,
      },
    });
    if (imageLinks) {
      const image = await this.imagesRepository.findById(imageLinks.image_id);
      return image;
    }
    return null;
  }

  async loginWithAuthProvider(
    providerData: AuthLoginProviderDto,
    providerName: AuthProviderEnum,
  ): Promise<IResponseUserToken> {
    // Check if user has been existings or not

    let userExists: UserEntity = await this.userService.findOne({
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
          [Table.USER_GROUPS]: {
            fieldJoin: `${Table.USER_GROUPS}.usergroup_id`,
            rootJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
          },
          [Table.USER_PROFILES]: {
            fieldJoin: `${Table.USER_PROFILES}.user_id`,
            rootJoin: `${Table.USERS}.user_id`,
          },
        },
      },
      where: { email: providerData.email },
    });

    if (!userExists) {
      userExists = await this.userService.create({
        firstname: providerData.givenName,
        lastname: providerData.familyName,
        email: providerData.email,
        created_at: convertToMySQLDateTime(),
      });
      // Create a new record at ddv_user_profiles
      const userProfile = await this.userProfileRepository.create({
        user_id: userExists.user_id,
        b_firstname: userExists.firstname,
        b_lastname: userExists.lastname,
      });
      //create a new record as customer position at ddv_usergroup_links
      const userGroupForCustomer = await this.createUserGroupLink(
        userExists.user_id,
        UserGroupTypeEnum.Customer,
      );
      userExists = { ...userExists, ...userProfile, ...userGroupForCustomer };
    }
    // Create image at ddv_images and ddv_image_links
    let userImageLink = await this.imageLinksRepository.findOne({
      where: {
        object_id: userExists.user_id,
        object_type: ImageObjectType.USER,
      },
    });
    let userImage;
    if (!userImageLink) {
      const userImage = await this.imagesRepository.create({
        image_path: providerData.imageUrl,
      });
      if (userImage) {
        userImageLink = await this.imageLinksRepository.create({
          object_id: userExists.user_id,
          object_type: ImageObjectType.USER,
          image_id: userImage.image_id,
        });
      }
    } else {
      userImage = await this.imagesRepository.findById(userImageLink.image_id);
    }
    userExists['image'] = userImage;
    // Create or update at ddv_users_auth_external table
    let authProvider: AuthProviderEntity = await this.authRepository.findOne({
      where: {
        user_id: userExists.user_id,
        provider_name: providerName,
      },
    });

    if (!authProvider) {
      authProvider = await this.authRepository.create({
        user_id: userExists.user_id,
        provider: providerData.id,
        provider_name: providerName,
        access_token: providerData.accessToken,
        extra_data: providerData.extra_data,
      });
    } else {
      authProvider = await this.authRepository.update(
        { user_id: authProvider.user_id, provider_name: providerName },
        {
          access_token: providerData.accessToken,
          extra_data: providerData.extra_data,
        },
      );
    }

    //Update current provider at ddv_users
    await this.userService.updateUser(userExists.user_id, {
      user_login: providerName,
    });

    userExists = { ...userExists, ...authProvider };
    const userData = {
      ...preprocessUserResult(userExists),
    };
    return {
      token: this.generateToken(userExists),
      userData,
    };
  }

  async loginWithGoogle(
    authLoginProviderDto: AuthLoginProviderDto,
  ): Promise<IResponseUserToken> {
    return this.loginWithAuthProvider(
      authLoginProviderDto,
      AuthProviderEnum.GOOGLE,
    );
  }
  async loginWithFacebook(
    authLoginProviderDto: AuthLoginProviderDto,
  ): Promise<IResponseUserToken> {
    return this.loginWithAuthProvider(
      authLoginProviderDto,
      AuthProviderEnum.FACEBOOK,
    );
  }

  async resetPasswordByEmail(url: string, email: string): Promise<boolean> {
    await this.userService.resetPasswordByEmail(url, email);
    return true;
  }
  async restorePasswordByEmail(
    user_id: string,
    token: string,
  ): Promise<UserEntity> {
    const user = await this.userService.restorePasswordByEmail(user_id, token);
    return user;
  }
  async updatePasswordByEmail(
    user_id: number,
    token: string,
    password: string,
  ): Promise<boolean> {
    await this.userService.updatePasswordByEmail(user_id, token, password);
    return true;
  }

  async resetPasswordByPhone(phone: string): Promise<number> {
    const user = await this.userService.findOne({ phone });
    if (!user) {
      throw new HttpException(
        'Số điện thoại chưa được đăng ký.',
        HttpStatus.NOT_FOUND,
      );
    }
    const newOTP = generateOTPDigits();

    await this.userService.updateUserOTP(user.user_id, newOTP);

    const client = twilio(
      'ACf45884c1ecedeb6821c81156065d8610',
      '08fa4d62968cbff2e9c017ccb3a16219',
    );

    await client.messages.create({
      body: `Mã OTP để xác nhận khôi phục mật khẩu là ${newOTP}, mã có hiệu lực trong vòng 90 giây, nhằm đảm bảo tài khoản được an toàn, quý khách vui lòng không chia sẽ mã này cho bất kỳ ai.`,
      from: '+16075368673',
      to: '+84939323700',
    });

    return newOTP;
  }

  async restorePasswordByOTP(user_id: number, otp: number): Promise<boolean> {
    return await this.userService.restorePasswordByOTP(user_id, otp);
  }
}
