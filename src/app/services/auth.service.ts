import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthCredentialsDto } from '../dto/auth/auth-credential.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

import { saltHashPassword, desaltHashPassword } from '../../utils/cipherHelper';

import { AuthProviderRepository } from '../repositories/auth.repository';
import { AuthProviderEntity } from '../entities/auth_provider.entity';
import { Table } from '../../database/enums/tables.enum';
import { IResponseUserToken } from '../interfaces/response.interface';
import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/auth_provider.enum';
import {
  generateOTPDigits,
  convertToMySQLDateTime,
  preprocessUserResult,
} from '../../utils/helper';
import { AuthLoginProviderDto } from '../dto/auth/auth-login-provider.dto';
import * as twilio from 'twilio';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserGroupTypeEnum } from '../../database/enums/tableFieldEnum/user_groups.enum';
import {
  ImagesLinksRepository,
  ImagesRepository,
} from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/image_link_entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/image_types.enum';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UserGroupsService } from './usergroups.service';

import { UserGroupEntity } from '../entities/usergroups.entity';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { MailService } from './mail.service';
import { UserStatusEnum } from '../../database/enums/tableFieldEnum/user.enum';
import { UserMailingListRepository } from '../repositories/user_mailing_lists.repository';
import { UserMailingListsEntity } from '../entities/user-mailing-lists.entity';
import { v4 as uuid } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileEntity } from '../entities/user_profile.entity';
import { UserEntity, UserGeneralInfoEntity } from '../entities/user.entity';
import { UserGroupLinkService } from './usergroup_links.service';

import {
  UserMailingListsStatusEnum,
  UserMailingListsTypeEnum,
} from 'src/database/enums/tableFieldEnum/user_mailing_lists.enum';
import { UserGroupsPrivilegeService } from './usergroup_privilege.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private userGroupService: UserGroupsService,
    private userGroupLinksService: UserGroupLinkService,
    private userGroupsPrivilegeService: UserGroupsPrivilegeService,
    private jwtService: JwtService,
    private mailService: MailService,
    private authRepository: AuthProviderRepository<AuthProviderEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userRepository: UserRepository<UserEntity>,
    private imageLinksRepository: ImagesLinksRepository<ImagesLinksEntity>,
    private userMailingListRepository: UserMailingListRepository<UserMailingListsEntity>,
    private imagesRepository: ImagesRepository<ImagesEntity>,
  ) {}

  generateToken(user: UserEntity): string {
    const payload = {
      sub: user,
    };
    return this.jwtService.sign(payload);
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { firstname, lastname, email, password, phone } = authCredentialsDto;
    const { passwordHash, salt } = saltHashPassword(password);
    const checkEmailExist = await this.userRepository.findOne({ email });
    if (checkEmailExist) {
      throw new HttpException('Địa chỉ email đã tồn tại.', 409);
    }

    const checkPhoneExist = await this.userRepository.findOne({ phone });

    if (checkPhoneExist) {
      throw new HttpException('Số điện thoại đã tồn tại.', 409);
    }

    let user = await this.userService.createUser({
      firstname,
      lastname,
      user_login: AuthProviderEnum.SYSTEM,
      email,
      password: passwordHash,
      phone,
      salt,
      status: UserStatusEnum.Deactive,
      created_at: convertToMySQLDateTime(),
    });
    //create a new record as customer position at ddv_usergroup_links
    const userGroupForCustomer: UserGroupEntity =
      await this.userGroupLinksService.createUserGroupLinkPosition(
        user.user_id,
        UserGroupTypeEnum.Customer,
      );
    //create a new record at ddv_user_profiles
    const newUserProfile = await this.userService.createUserProfile({
      user_id: user.user_id,
      b_firstname: firstname,
      b_lastname: lastname,
      b_phone: phone,
    });
    // Create a new record at ddv_user_data
    const newUserData = await this.userService.createUserData({
      user_id: user.user_id,
      type: '',
      data: '',
    });

    // Create a new record to user mailing list db and send email
    this.sendMailActivateSignUpAccount(user);
  }

  async login(data: any): Promise<IResponseUserToken> {
    const phone = data['phone'];
    const email = data['email'];
    const password = data['password'];
    console.log(phone, email.password);
    let user: UserGeneralInfoEntity = phone
      ? await this.userService.findUserAllInfo({ phone })
      : await this.userService.findUserAllInfo({ email });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    if (user.status === UserStatusEnum.Deactive) {
      throw new HttpException(
        'Tài khoản chưa được kích hoạt, vui lòng truy cập vào email để kích hoạt tài khoản.',
        HttpStatus.UNAUTHORIZED,
      );
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

    // get menu at ddv_usergroup_privileges
    const menu = await this.userGroupsPrivilegeService.getListByUserGroupId(
      user.usergroup_id,
    );

    user['menu'] = menu;

    const dataResult = {
      token: this.generateToken(user),
      userData: preprocessUserResult(user),
    };

    return dataResult;
  }

  async getUserImage(user_id: number): Promise<any> {
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

    let userExists = await this.userService.findUserAllInfo({
      email: providerData.email,
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
      const userGroupForCustomer =
        await this.userGroupLinksService.createUserGroupLinkPosition(
          userExists.user_id,
          UserGroupTypeEnum.Customer,
        );
      // Create a new record at ddv_user_data
      const newUserData = await this.userService.createUserData({
        user_id: userExists.user_id,
        type: '',
        data: '',
      });
      userExists = {
        ...userExists,
        ...userProfile,
        ...userGroupForCustomer,
        ...newUserData,
      };
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

    const menu = await this.userGroupsPrivilegeService.getListByUserGroupId(
      userExists.usergroup_id,
    );

    userExists['menu'] = menu;

    //Update current provider at ddv_users
    await this.userService.updateUser(userExists.user_id, {
      user_login: providerName,
    });

    userExists = { ...userExists, ...authProvider };
    const userData = {
      ...preprocessUserResult(userExists),
    };

    return {
      token: this.generateToken(userData),
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

  async activeSignUpAccount(user_id: number, token: string): Promise<any> {
    const checkMail: UserMailingListsEntity =
      await this.userMailingListRepository.findOne({
        subscriber_id: user_id,
        activation_key: token,
        status: UserMailingListsStatusEnum.Active,
      });
    if (!checkMail) {
      throw new HttpException(
        'Không tìm thấy email mail phù hợp .',
        HttpStatus.NOT_FOUND,
      );
    }
    if (checkMail.confirmed !== 0) {
      throw new HttpException('Token đã được sử dụng.', HttpStatus.NOT_FOUND);
    }
    if (new Date(checkMail.expired_at).getTime() < new Date().getTime()) {
      await this.userMailingListRepository.delete({
        list_id: checkMail.list_id,
      });
      throw new HttpException(
        'Mã xác thực đã hết hạn, vui lòng kích hoạt lại.',
        408,
      );
    }
    // Update user
    await this.userRepository.update(user_id, {
      status: UserStatusEnum.Active,
    });
    // Update email
    await this.userMailingListRepository.update(checkMail.list_id, {
      confirmed: 1,
      status: UserMailingListsStatusEnum.Disabled,
    });

    const user = await this.userService.findUserAllInfo({
      [`${Table.USERS}.user_id`]: user_id,
    });

    if (user.usergroup_id) {
      const menu = await this.userGroupsPrivilegeService.getListByUserGroupId(
        user.usergroup_id,
      );
      user['menu'] = menu;
    }
    return {
      token: this.generateToken(user),
      userData: preprocessUserResult(user),
    };
  }

  async sendMailActivateSignUpAccount(user: UserEntity): Promise<void> {
    // Create a record at ddv_user_mailings_list
    const newMailingList: UserMailingListsEntity =
      await this.userMailingListRepository.create({
        subscriber_id: user.user_id,
        activation_key: uuid().replace(/-/g, ''),
        confirmed: 0,
        type: UserMailingListsTypeEnum.ActivateSignUpAccount,
        expired_at: convertToMySQLDateTime(
          new Date(Date.now() + 24 * 3600 * 1000),
        ),
        created_at: convertToMySQLDateTime(),
      });
    // Send email
    await this.mailService.sendUserActivateSignUpAccount(
      user,
      newMailingList.activation_key,
    );
  }

  async reactivateSignUpAccount(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new HttpException('Email không tồn tại.', HttpStatus.NOT_FOUND);
    }
    // find
    const oldSignUpMailsList = await this.userMailingListRepository.find({
      email,
      type: UserMailingListsTypeEnum.ActivateSignUpAccount,
    });
    // Disabled all old mail status
    if (oldSignUpMailsList.length) {
      for (let mailItem of oldSignUpMailsList) {
        await this.userMailingListRepository.update(mailItem.list_id, {
          status: UserMailingListsStatusEnum.Disabled,
        });
      }
    }
    // create new mail
    await this.sendMailActivateSignUpAccount(user);
  }
}
