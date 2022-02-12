import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthCredentialsDto } from '../dto/auth/auth-credential.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

import { saltHashPassword, desaltHashPassword } from '../../utils/cipherHelper';

import { AuthProviderRepository } from '../repositories/auth.repository';
import { AuthProviderEntity } from '../entities/authProvider.entity';
import { Table } from '../../database/enums/tables.enum';
import { IResponseUserToken } from '../interfaces/response.interface';
import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/authProvider.enum';
import {
  convertToMySQLDateTime,
  preprocessUserResult,
} from '../../utils/helper';
import { AuthLoginProviderDto } from '../dto/auth/auth-login-provider.dto';

import { HttpException, HttpStatus } from '@nestjs/common';
import { UserGroupTypeEnum } from '../../database/enums/tableFieldEnum/userGroups.enum';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';

import { UserGroupsService } from './usergroups.service';

import { UserGroupEntity } from '../entities/usergroups.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { MailService } from './mail.service';
import { UserStatusEnum } from '../../database/enums/tableFieldEnum/user.enum';
import { UserMailingListRepository } from '../repositories/userMailingLists.repository';
import { UserMailingListsEntity } from '../entities/userMailingLists.entity';
import { v4 as uuid } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { UserEntity } from '../entities/user.entity';
import { UserGroupLinkService } from './usergroupLinks.service';

import {
  UserMailingListsStatusEnum,
  UserMailingListsTypeEnum,
} from 'src/database/enums/tableFieldEnum/userMailingLists.enum';
import { UserGroupsPrivilegeService } from './usergroupPrivilege.service';
import { UserGeneralInfoEntity } from '../entities/userGeneralInfo.entity';
import { IImage } from '../interfaces/image.interface';

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

    // After creating a new record, we need sent an email to activate
    console.log(99, user);

    try {
      await this.sendMailActivateSignUpAccount(user);
    } catch (error) {
      // If sent email fail, a new record will be deleted immediately, the process below will be not performed
      await this.userRepository.delete(user.user_id);
      throw new HttpException(`Lỗi trong quá trình gửi email : ${error}`, 500);
    }

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
  }

  async login(data: any): Promise<IResponseUserToken> {
    const phone = data['phone'];
    const email = data['email'];
    const password = data['password'];

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

    await this.userService.update(user.user_id, {
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

  async getUserImage(user_id: number): Promise<IImage> {
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
    await this.userService.update(userExists.user_id, {
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

  async activeSignUpAccount(
    user_id: number,
    token: string,
  ): Promise<IResponseUserToken> {
    //Firstly, check user status has been active or not
    const checkUserHasBeenActive = await this.userRepository.findById(user_id);
    if (checkUserHasBeenActive.status === UserStatusEnum.Active) {
      throw new HttpException(
        'Tài khoản đã được kích hoạt, bạn có thể đăng nhập.',
        409,
      );
    }

    const checkMail: UserMailingListsEntity =
      await this.userMailingListRepository.findOne({
        subscriber_id: user_id,
        activation_key: token,
      });

    if (!checkMail) {
      throw new HttpException(
        'Mã xác thực hoặc người dùng không đúng.',
        HttpStatus.NOT_FOUND,
      );
    }

    // check user has been activate email
    // If user still not activate email, check mail expiration
    if (checkMail.confirmed === 0) {
      if (new Date(checkMail.expired_at).getTime() < new Date().getTime()) {
        throw new HttpException(
          'Mã xác thực đã hết hạn, vui lòng kích hoạt lại.',
          408,
        );
      }
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
    // Create a record at ddv_user_mailings_list with 1 day expiration
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
    return new Promise(async (resolve, reject) => {
      try {
        await this.mailService.sendUserActivateSignUpAccount(
          user,
          newMailingList.activation_key,
        );
        resolve();
      } catch (error) {
        // Delete new mail if sending mail failed
        await this.userMailingListRepository.delete(newMailingList.list_id);
        reject(error);
      }
    });
  }

  async reactivateSignUpAccount(user_id: string): Promise<void> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new HttpException(
        'Người dùng không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === UserStatusEnum.Active) {
      throw new HttpException(
        'Tài khoản đã hoạt động, bạn có thể đăng nhập.',
        409,
      );
    }

    // create new mail
    await this.sendMailActivateSignUpAccount(user);
  }
}
