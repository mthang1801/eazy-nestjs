import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UserRepository } from './user.repository';
import {
  LogicalOperator,
  ComparisonOperator,
  Table,
  SortBy,
  JoinTable,
} from '../../../database/enums/index';
import { convertToMySQLDateTime } from '../../../utils/helper';
import { Like } from '../../../database/find-options/operators';
import * as bcrypt from 'bcrypt';
import { BaseService } from '../../../base/base.service';
import { LoggerService } from '../../../logger/custom.logger';
import { ObjectLiteral } from '../../../common/ObjectLiteral';
import { AuthProviderEnum } from '../auth/enums/provider.enum';
import { PrimaryKeys } from '../../../database/enums/primary-keys.enum';
import {
  UserAuthSocialMedia,
  NewUserAuthSocialMedia,
} from './interfaces/users.interfaces';
import { saltHashPassword } from '../../../utils/cipherHelper';
@Injectable()
export class UsersService extends BaseService<User, UserRepository<User>> {
  constructor(
    private readonly mailService: MailService,
    repository: UserRepository<User>,
    logger: LoggerService,
    table: Table,
  ) {
    super(repository, logger, table);
    this.table = Table.USERS;
  }

  async createUser(registerData): Promise<User> {
    try {
      const checkUserExists = await this.repository.findOne({
        where: [{ email: registerData.email }, { phone: registerData.phone }],
      });
      if (checkUserExists) {
        throw new BadRequestException({
          message: 'Địa chỉ email hoặc số điện thoại đã được đăng ký.',
        });
      }
      const user = await this.repository.create(registerData);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async loginThroughSocialMedia(
    user: UserAuthSocialMedia,
    provider: AuthProviderEnum,
  ): Promise<void> {
    // if (!user.accessToken && !user.refreshToken) {
    //   throw new InternalServerErrorException({
    //     message: 'Not found access token or refresh token',
    //   });
    // }
    // // 1. Tạo một google_access để lưu giữ refresh token và access_token,
    // // 2. Đối với table User
    // // TH1 : Nếu người dùng chưa có tài khoản -> tạo mới tài khoản ->
    // //    i.  Gán id của google_access ở B1 vào google_access_id của User sắp khởi tạo
    // //    ii. Truyền profile và avatar vào cho user
    // //    iii. Vì password và phone là bắt buộc nhưng do tài khoản là google nên có 2 cách giải quyết
    // ///       C1 : Gán mặc định một password random, phone mặc định là '0'
    // ///       C2 : Tạo frontend stepper cho buộc người dùng nhập thêm thông tin, nhưng password không bắt buộc nên vẫn là random
    // // TH2 : Nếu người dùng đã có tài khoản SYSTEM ->
    // //    i. Gán id của google_access ở B1 vào google_access_id của User sắp khởi tạo
    // //    ii. Đối với những fields profile nào người dùng để trống, đưa profile của google vào, ngược lại bỏ qua
    // // **Lưu ý: ** Mỗi người dùng ngoài SYSTEM chỉ có thể đăng nhập bằng 1 provider
    // let userExist: User = await this.findOne({ email: user.email });
    // const keysAccess = {
    //   accessToken: user.accessToken,
    //   refreshToken: user.refreshToken || 'empty',
    // };
    // const tableProviderAccess =
    //   provider === AuthProviderEnum.GOOGLE
    //     ? Table.GOOGLE_ACCESS
    //     : Table.FACEBOOK_ACCESS;
    // // Nhận diện google_access_id hoặc facebook_access_id
    // const userProviderField =
    //   provider === AuthProviderEnum.GOOGLE
    //     ? 'google_access_id'
    //     : 'facebook_access_id';
    // if (!userExist) {
    //   // Tạo access provider trước khi tạo user
    //   const accessProviderRes = await this.repository.create(keysAccess);
    //   const newUser = {
    //     [userProviderField]: accessProviderRes.id,
    //     displayName: user.displayName,
    //     firstName: user.givenName,
    //     lastName: user.familyName,
    //     avatar: user.avatar,
    //     email: user.email,
    //     provider,
    //     password: uuidv4(),
    //     phone: '0',
    //   };
    //   const newUserRes = await this.repository.create(newUser);
    //   return newUserRes;
    // }
    // // Kiểm tra người dùng đã đăng nhập tới provider khác hay chưa
    // if (
    //   userExist.provider.toLowerCase() !== AuthProviderEnum.SYSTEM.toLowerCase() &&
    //   userExist.provider.toLowerCase() !== provider.toLowerCase()
    // ) {
    //   throw new BadRequestException({
    //     message:
    //       'Người dùng đã kết nối đến provider khác, không thể kết nối thêm, vui lòng điều hướng người dùng đến provider SYSTEM hoặc provider đã đăng nhập trước đó',
    //   });
    // }
    // // Nếu User đã tồn tại, tài khoản đó có thể đã có ProviderId nhưng cũng có thể chỉ là SYSTEM
    // // Nếu chỉ là tài khoản SYSTEM, cần cấp thêm Provider cho tài khoản đó
    // let updatedUser: any = {};
    // let accessProviderRes: any;
    // if (!userExist[userProviderField]) {
    //   accessProviderRes = await this.repository.create(keysAccess);
    // } else {
    //   // const updatedRes = await this.repository.update(
    //   //   { id: userExist[userProviderField] },
    //   //   [keysAccess],
    //   // );
    //   // if (!updatedRes) {
    //   //   throw new InternalServerErrorException({
    //   //     message: 'Cập nhật token không thành công.',
    //   //   });
    //   // }
    // }
    // updatedUser[userProviderField] =
    //   accessProviderRes?.id || userExist[userProviderField];
    // updatedUser['displayName'] = userExist.displayName || user.displayName;
    // updatedUser['firstName'] = userExist.firstName || user.givenName;
    // updatedUser['lastName'] = userExist.lastName || user.familyName;
    // updatedUser['avatar'] = userExist.avatar || user.avatar;
    // updatedUser['provider'] = provider;
    // updatedUser['updatedAt'] = convertDateToTimeStamp(new Date());
    // // Update lại access provider trước khi update user
    // await this.repository.updateOne({ id: userExist.id }, [updatedUser]);
    // const updatedUserResult = {
    //   ...userExist,
    //   ...updatedUser,
    // };
    // return updatedUserResult;
  }
  async loginWithGoogle(user: UserAuthSocialMedia): Promise<void> {
    // return this.loginThroughSocialMedia(user, AuthProviderEnum.GOOGLE);
  }
  async loginWithFacebook(user: UserAuthSocialMedia): Promise<void> {
    // return this.loginThroughSocialMedia(user, AuthProviderEnum.FACEBOOK);
  }

  async findById(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    const userObject = JSON.parse(JSON.stringify(user));
    delete userObject.password;
    return userObject;
  }

  async updateUserInfo(user_id: number, dataObj: ObjectLiteral): Promise<User> {
    const updatedUser = await this.repository.updateOne(
      { where: { user_id } },
      dataObj,
    );
    delete updatedUser.password;
    return updatedUser;
  }

  async findOne(dataObj: ObjectLiteral | ObjectLiteral[]): Promise<User> {
    try {
      const user = await this.repository.findOne({ where: dataObj });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetPasswordByEmail(
    originUrl: string,
    email: string,
  ): Promise<boolean> {
    const user: any = await this.repository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException();
    }

    try {
      const verifyToken = uuidv4();

      const updatedUser = await this.repository.updateOne(
        { where: { [PrimaryKeys[this.table]]: user[PrimaryKeys[this.table]] } },
        {
          verify_token: verifyToken,
          verify_token_exp: convertToMySQLDateTime(
            new Date(Date.now() + 2 * 3600 * 1000),
          ),
        },
      );

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

  async getMyInfo(id: string): Promise<User> {
    try {
      const user = await this.repository.findOne({
        where: { [PrimaryKeys[this.table]]: id },
      });

      // const test = await this.repository.find({
      //   select: ['*'],
      //   join: {
      //     alias: 'user',
      //     [JoinTable.leftJoin]: {
      //       orders: { fieldJoin: 'customer_id', rootJoin: 'id' },
      //       orderItem: {
      //         fieldJoin: 'orderItem.orderId',
      //         rootJoin: 'orders.order_id',
      //       },
      //       products: {
      //         fieldJoin: 'products.product_id',
      //         rootJoin: 'orderItem.productId',
      //       },
      //     },
      //   },
      //   where: [
      //     { firstName: Like('Mai văn'), lastName: 'Quốc' },
      //     { firstName: [Like('Mai'), 'Nguyễn'], lastName: 'Bê' },
      //     { firstName: 'Mai văn', lastName: 'Thắng' },
      //     { firstName: 'Quang' },
      //   ],
      //   // where: {
      //   //   firstName: [Like('Mai'), 'Nguyễn'],
      //   //   lastName: Like('Thắng'),
      //   //   country: Like('VietNam'),
      //   //   email: 'mthang1801@gmail.com',
      //   // },
      //   orderBy: [
      //     { field: 'orderItem.id', sort_by: SortBy.ASC },
      //     { field: 'product.price', sort_by: SortBy.DESC },
      //     { field: 'product.id', sort_by: SortBy.ASC },
      //     { field: 'product.quantity', sort_by: SortBy.DESC },
      //   ],
      //   skip: 0,
      //   limit: 30,
      // });
      // console.log(test);
      const userObject = JSON.parse(JSON.stringify(user));
      delete userObject.password;
      return userObject;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async restorePasswordByEmail(user_id: string, token: string): Promise<any> {
    const checkUser: any = await this.repository.findOne({
      where: { user_id, verify_token: token },
    });

    if (!checkUser) {
      throw new NotFoundException();
    }

    if (
      new Date(
        new Date(checkUser.verify_token_exp).getTime() * 7 * 3600 * 1000,
      ) < new Date()
    ) {
      throw new RequestTimeoutException({
        status_code: 400,
        message: 'Token đã hết hạn.',
      });
    }
  }

  async updatePasswordByEmail(
    user_id: number,
    token: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const user: any = await this.repository.findOne({
        where: {
          user_id,
          verify_token: token,
        },
      });
      if (!user) {
        throw new NotFoundException();
      }
      const { passwordHash, salt } = saltHashPassword(newPassword);

      await this.repository.updateOne(
        { where: { user_id } },
        {
          password: passwordHash,
          salt,
          verify_token: '',
        },
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}