import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthCredentialsDto } from '../dto/auth/auth-credential.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { desaltHashPassword, generateSHA512 } from '../../utils/cipherHelper';
import { AuthProviderRepository } from '../repositories/auth.repository';
import { AuthProviderEntity } from '../entities/authProvider.entity';
import { Table } from '../../database/enums/tables.enum';
import { IResponseUserToken } from '../interfaces/response.interface';
import { AuthProviderEnum } from '../../database/enums/tableFieldEnum/authProvider.enum';
import {
  formatStandardTimeStamp,
  preprocessUserResult,
} from '../../utils/helper';
import { AuthLoginProviderDto } from '../dto/auth/auth-loginProvider.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRoleTypeEnum } from '../../database/enums/tableFieldEnum/userGroups.enum';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { RoleService } from './role.service';
import { RoleEntity } from '../entities/role.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { MailService } from './mail.service';
import {
  UserStatusEnum,
  UserTypeEnum,
} from '../../database/enums/tableFieldEnum/user.enum';
import { UserMailingListRepository } from '../repositories/userMailingLists.repository';
import { UserMailingListsEntity } from '../entities/userMailingLists.entity';
import { v4 as uuid } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { UserEntity } from '../entities/user.entity';
import { UserRoleService } from './userRole.service';

import {
  UserMailingListsStatusEnum,
  UserMailingListsTypeEnum,
} from 'src/database/enums/tableFieldEnum/userMailingLists.enum';
import { RoleFunctService } from './roleFunct.service';
import { IImage } from '../interfaces/image.interface';
import { AuthRestoreDto } from '../dto/auth/auth-restore.dto';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { itgCustomerToAppcore } from '../../utils/integrateFunctions';
import { CustomerService } from './customer.service';
import axios from 'axios';
import { UserDataEntity } from '../entities/userData.entity';
import { UserDataRepository } from '../repositories/userData.repository';
import { generateRandomNumber } from '../../utils/helper';
import {
  sha512,
  encodeBase64String,
  saltHashPassword,
} from '../../utils/cipherHelper';
import { FunctRepository } from '../repositories/funct.repository';
import { FunctEntity } from '../entities/funct.entity';
import { menuSelector, userSelector } from '../../utils/tableSelector';
import {
  userRoleJoiner,
  userRoleFunctJoiner,
  userJoiner,
} from '../../utils/joinTable';
import { UserRoleRepository } from '../repositories/userRole.repository';
import { UserRoleEntity } from '../entities/userRole.entity';
import { RoleFunctionRepository } from '../repositories/roleFunction.repository';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';
import { Cryptography } from '../../utils/cryptography';
import { SortBy } from '../../database/enums/sortBy.enum';
import { Equal, Not } from '../../database/operators/operators';
import { defaultPassword } from '../../constants/defaultPassword';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private userGroupService: RoleService,
    private userGroupLinksService: UserRoleService,
    private RoleFunctService: RoleFunctService,
    private jwtService: JwtService,
    private mailService: MailService,
    private authRepository: AuthProviderRepository<AuthProviderEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
    private userRepository: UserRepository<UserEntity>,
    private userDataRepo: UserDataRepository<UserDataEntity>,
    private userRepo: UserRepository<UserEntity>,
    private userLoyaltyRepo: UserLoyaltyRepository<UserLoyaltyEntity>,
    private imageLinksRepository: ImagesLinksRepository<ImagesLinksEntity>,
    private userMailingListRepository: UserMailingListRepository<UserMailingListsEntity>,
    private imagesRepository: ImagesRepository<ImagesEntity>,
    private customerService: CustomerService,
    private functRepo: FunctRepository<FunctEntity>,
    private userRoleRepo: UserRoleRepository<UserRoleEntity>,
    private roleFunctRepo: RoleFunctionRepository<RoleFunctionEntity>,
    private userProfileRepo: UserProfileRepository<UserProfileEntity>,
  ) {}

  generateToken(user: UserEntity, uuid): string {
    const payload = {
      sub: {
        user_id: uuid,
        lastname: user.lastname,
        firstname: user.firstname,
      },
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
    let user;
    if (checkPhoneExist && checkPhoneExist.account_type === 2) {
      user = await this.userRepository.update(
        {
          user_id: checkPhoneExist.user_id,
        },
        {
          firstname,
          lastname,
          email,
          password: passwordHash,
          salt,
          account_type: 1,
          status: 'D',
          user_type: UserTypeEnum.Customer,
        },
        true,
      );

      let userProfile = await this.userProfileRepository.findOne({
        user_id: checkPhoneExist.user_id,
      });

      if (!userProfile) {
        const newUserProfile = {
          ...new UserProfileEntity(),
          b_phone: phone,
          b_lastname: firstname + ' ' + lastname,
          user_id: checkPhoneExist.user_id,
        };
        await this.userProfileRepository.create(newUserProfile);
      }

      await this.userMailingListRepository.delete({
        subscriber_id: user.user_id,
        type: UserMailingListsTypeEnum.ActivateSignUpAccount,
      });

      await this.sendMailService(
        user,
        UserMailingListsTypeEnum.ActivateSignUpAccount,
      );
      return;
    }

    if (checkPhoneExist && checkPhoneExist.account_type === 1) {
      throw new HttpException('Số điện thoại đã tồn tại.', 409);
    }

    user = await this.userRepo.create({
      firstname,
      lastname,
      user_login: AuthProviderEnum.SYSTEM,
      email,
      password: passwordHash,
      phone,
      salt,
      account_type: 1,
      status: UserStatusEnum.Deactive,
      created_at: formatStandardTimeStamp(),
    });

    let result = { ...user };

    //create a new record at ddv_user_profiles
    const newUserProfile = await this.userProfileRepo.create({
      user_id: user['user_id'],
      b_lastname: firstname + ' ' + lastname,
      b_phone: phone,
      profile_name: `${firstname} ${lastname}`,
    });

    result = { ...result, ...newUserProfile };

    const userData = {
      ...new UserDataEntity(),
      user_id: result['user_id'],
    };
    // Create a new record at ddv_user_data
    const newUserData = await this.userDataRepo.create(userData);

    result = { ...result, ...newUserData };

    //create a new record at ddv_user_loyalty
    const newUserLoyalty = await this.userLoyaltyRepo.create({
      user_id: result['user_id'],
    });

    result = { ...result, ...newUserLoyalty };

    await this.customerService.createCustomerToAppcore(result);

    // Create a new record to user mailing list db and send email
    this.sendMailService(user, UserMailingListsTypeEnum.ActivateSignUpAccount);
  }

  async login(data: any) {
    const phone = data['phone'];
    const email = data['email'];
    const password = data['password'];

    let user = phone
      ? await this.userRepository.findOne({ phone })
      : await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    if (user.status === UserStatusEnum.Deactive) {
      throw new HttpException(
        'Tài khoản chưa được kích hoạt, vui lòng truy cập vào email để kích hoạt tài khoản.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.user_type != UserTypeEnum.Employee) {
      throw new HttpException('Người dùng không nằm trong hệ thống.', 401);
    }

    if (desaltHashPassword(password, user.salt) !== user.password) {
      throw new HttpException(
        phone
          ? 'Số điện thoại hoặc mật khẩu không đúng.'
          : 'Địa chỉ email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.userRepository.update(
      { user_id: user.user_id },
      {
        user_login: AuthProviderEnum.SYSTEM,
        last_login: formatStandardTimeStamp(),
      },
    );

    let sortFilter = [
      {
        field: `${Table.FUNC}.position`,
        sortBy: SortBy.ASC,
      },
    ];

    // get menu at ddv_roles_functs
    const menuList = await this.roleFunctRepo.find({
      select: menuSelector,
      join: userRoleFunctJoiner,
      where: {
        level: 0,
        [`${Table.USER_ROLES}.user_id`]: user['user_id'],
      },
      orderBy: sortFilter,
    });

    if (menuList.length) {
      for (let menuItem of menuList) {
        let menu = await this.roleFunctRepo.find({
          select: menuSelector,
          join: userRoleFunctJoiner,
          where: {
            level: 1,
            parent_id: menuItem['funct_id'],
            [`${Table.USER_ROLES}.user_id`]: user['user_id'],
          },
          orderBy: sortFilter,
        });
        menuItem['children'] = menu;
      }
    }

    const cryptography = new Cryptography();
    const encryptedData = cryptography.encrypt(`${uuid()}-${user['user_id']}`);

    const dataResult = {
      token: this.generateToken(user, encryptedData),
      userData: {
        firstname: user['firstname'],
        lastname: user['lastname'],
        avatar: user['avatar'],
      },
      uuid: encryptedData,
      menu: menuList,
    };

    return dataResult;
  }
  async loginFE(data: any) {
    const phone = data['phone'];
    const email = data['email'];
    const password = data['password'];

    let user = phone
      ? await this.userRepository.findOne({ phone })
      : await this.userRepository.findOne({ email });

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

    await this.userRepository.update(
      { user_id: user.user_id },
      {
        user_login: AuthProviderEnum.SYSTEM,
        last_login: formatStandardTimeStamp(),
      },
    );

    const dataResult = {
      token: this.generateToken(user, user['user_id']),
      userData: {
        user_id: user['user_id'],
        phone: user['phone'],
        email: user['email'],
        firstname: user['firstname'],
        lastname: user['lastname'],
        avatar: user['avatar'],
      },
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
  ): Promise<any> {
    // Check if user has been existings or not

    let userExists: any = await this.userRepository.findOne({
      email: providerData.email,
    });

    if (!userExists) {
      let lastname = providerData.familyName + ' ' + providerData.givenName;
      lastname = lastname.trim();
      console.log(lastname);
      try {
        const { passwordHash, salt } = saltHashPassword(defaultPassword);
        const userData = {
          ...new UserEntity(),
          firstname: providerData.givenName,
          lastname,
          email: providerData.email,
          phone: generateRandomNumber(10),
          account_type: 1,
          avatar: providerData.imageUrl,
          password: passwordHash,
          salt,
        };
        userExists = await this.userRepository.create(userData);

        // Create a new record at ddv_user_profiles
        const userProfile = await this.userProfileRepository.create({
          user_id: userExists.user_id,
          b_lastname: lastname,
        });

        // Create a new record at ddv_user_data
        const userDataData = {
          ...new UserDataEntity(),
          user_id: userExists.user_id,
        };
        const newUserData = await this.userService.createUserData(userDataData);

        //create a new record at ddv_user_loyalty
        const newUserLoyalty = await this.userLoyaltyRepo.create({
          user_id: userExists.user_id,
        });

        const user = await this.userRepository.findOne({
          select: userSelector,
          join: userJoiner,
          where: { [`${Table.USERS}.user_id`]: userExists.user_id },
        });
        await this.customerService.createCustomerToAppcore(user);

        userExists = {
          ...userExists,
          ...userProfile,
          ...newUserLoyalty,
          ...newUserData,
        };
      } catch (error) {
        console.log(error);
        throw new HttpException(
          `Có lỗi xảy ra : ${
            error?.response?.data?.message ||
            error?.response?.data ||
            error.message
          }`,
          error.response.status || error.status,
        );
      }
    }

    // Create or update at ddv_users_auth_external table
    let authProvider: AuthProviderEntity = await this.authRepository.findOne({
      user_id: userExists.user_id,
      provider_name: providerName,
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
        true,
      );
    }

    //Update current provider at ddv_users
    await this.userRepository.update(userExists['user_id'], {
      user_login: providerName,
    });

    return {
      token: this.generateToken(userExists, userExists['user_id']),
      userData: {
        user_id: userExists['user_id'],
        firstname: userExists['firstname'],
        lastname: userExists['lastname'],
        avatar: userExists['avatar'],
      },
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

  async resetPasswordByEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new HttpException('Email không tồn tại.', 404);
    }

    await this.sendMailService(user, UserMailingListsTypeEnum.ResetPassword);
  }

  async activeSignUpAccount(user_id: number, token: string) {
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
    await this.userRepository.update(
      { user_id },
      {
        status: UserStatusEnum.Active,
        updated_at: formatStandardTimeStamp(),
      },
    );

    // Update email
    await this.userMailingListRepository.update(
      { list_id: checkMail.list_id },
      {
        confirmed: 1,
        status: UserMailingListsStatusEnum.Disabled,
      },
    );

    const user = await this.userRepository.findOne({
      [`${Table.USERS}.user_id`]: user_id,
    });

    const userIdEncoded = encodeBase64String(
      `${uuid()}-${user['user_id']}-${uuid()}`,
    );

    return {
      token: this.generateToken(user, userIdEncoded),
      userData: {
        user_id: user['user_id'],
        firstname: user['firstname'],
        lastname: user['lastname'],
        avatar: user['avatar'],
      },
    };
  }

  async restorePasswordEmailFE(data: AuthRestoreDto) {
    const { user_id, token, password } = data;

    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new HttpException(
        'Người dùng không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    const checkMailingList = await this.userMailingListRepository.findOne({
      subscriber_id: user_id,
      activation_key: token,
    });

    if (!checkMailingList) {
      throw new HttpException(
        'Mã kích hoạt hoặc người dùng không đúng.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (checkMailingList.confirmed !== 0) {
      throw new HttpException('Mã kích hoạt đã được sử dụng.', 409);
    }

    // update email
    await this.userMailingListRepository.update(
      { list_id: checkMailingList.list_id },
      {
        confirmed: 1,
      },
    );

    // update user
    const { passwordHash, salt } = saltHashPassword(password);

    const updatedUser = await this.userRepository.update(
      { user_id },
      {
        password: passwordHash,
        salt,
        user_type: 'C',
        account_type: 1,
        status: 'A',
        updated_at: formatStandardTimeStamp(),
      },
      true,
    );

    const userLogin = { email: updatedUser.email, password };
    return this.loginFE(userLogin);
  }

  async sendMailService(
    user: UserEntity,
    type: string = UserMailingListsTypeEnum.ActivateSignUpAccount,
  ): Promise<void> {
    // Create a record at ddv_user_mailings_list
    const newMailingList: UserMailingListsEntity =
      await this.userMailingListRepository.create({
        subscriber_id: user['user_id'],
        activation_key: uuid().replace(/-/g, ''),
        confirmed: 0,
        type,
        expired_at: formatStandardTimeStamp(
          new Date(Date.now() + 24 * 3600 * 1000),
        ),
        created_at: formatStandardTimeStamp(),
      });

    switch (type) {
      case UserMailingListsTypeEnum.ActivateSignUpAccount: {
        await this.mailService.sendUserActivateSignUpAccount(
          user,
          newMailingList.activation_key,
        );
        break;
      }
      case UserMailingListsTypeEnum.ResetPassword: {
        await this.mailService.sendMailResetPassword(
          user,
          newMailingList.activation_key,
        );
        break;
      }
    }
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
    await this.sendMailService(
      user,
      UserMailingListsTypeEnum.ActivateSignUpAccount,
    );
  }

  async changePassword(data, user) {
    console.log(data);
    const tempUser = await this.userRepository.findOne({
      user_id: user.user_id,
    });
    console.log(tempUser.salt);
    console.log(tempUser.password);
    console.log(
      '----------------------------------------ABCDEF--------------------------------------------',
    );
    if (
      desaltHashPassword(data.oldPassword, tempUser.salt) !== tempUser.password
    ) {
      throw new HttpException(
        tempUser.phone
          ? 'Số điện thoại hoặc mật khẩu không đúng.'
          : 'Địa chỉ email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      desaltHashPassword(data.newPassword, tempUser.salt) === tempUser.password
    ) {
      throw new HttpException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { passwordHash, salt } = saltHashPassword(data.newPassword);

    const updatedUser = await this.userRepository.update(
      { user_id: tempUser.user_id },
      {
        password: passwordHash,
        salt,
        updated_at: formatStandardTimeStamp(),
      },
      true,
    );
  }
}
