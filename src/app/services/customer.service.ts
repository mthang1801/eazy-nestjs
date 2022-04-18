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
import { Like } from 'src/database/operators/operators';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import {
  convertNullDatetimeData,
  formatStandardTimeStamp,
  generateRandomPassword,
  preprocessUserResult,
} from 'src/utils/helper';
import { UserLoyaltyRepository } from '../repositories/userLoyalty.repository';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
import { saltHashPassword } from 'src/utils/cipherHelper';
import { MailService } from './mail.service';
import axios from 'axios';
import {
  importCustomersFromAppcore,
  itgCreateCustomerFromAppcore,
  itgCustomerFromAppcore,
  itgUpdateCustomerFromAppcore,
} from 'src/utils/integrateFunctions';
import { UserDataRepository } from '../repositories/userData.repository';
import { UserDataEntity } from '../entities/userData.entity';
import { UpdateCustomerAppcoreDto } from '../dto/customer/update-customerAppcore.dto';
import {
  UserStatusEnum,
  UserTypeEnum,
} from 'src/database/enums/tableFieldEnum/user.enum';
import { CreateCustomerAppcoreDto } from '../dto/customer/create-customerAppcore.dto';
import { CreateCustomerDto } from '../dto/customer/create-customer.dto';
import { itgCustomerToAppcore } from '../../utils/integrateFunctions';
import { filter, sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { defaultPassword } from '../../constants/defaultPassword';
import {
  CREATE_CUSTOMER_API,
  GET_CUSTOMERS_API,
  IMPORT_CUSTOMERS_API,
} from 'src/constants/api.appcore';
import { UpdateCustomerLoyalty } from '../dto/customer/update-customerLoyalty.appcore.dto';
import {
  Not,
  Equal,
  MoreThan,
  MoreThanOrEqual,
  LessThanOrEqual,
} from '../../database/operators/operators';
import { UserLoyaltyHistoryRepository } from '../repositories/userLoyaltyHistory.repository';
import { UserLoyaltyHistoryEntity } from '../entities/userLoyaltyHistory.entity';
import { CreateCustomerLoyalHistoryDto } from '../dto/customer/crate-customerLoyalHistory';
import * as moment from 'moment';
import { Between } from '../../database/operators/operators';
import { creatorJoiner } from '../../utils/joinTable';
import { formatCustomerTimestamp } from 'src/utils/services/customer.helper';
import { CreateCustomerPaymentDto } from '../dto/customer/create-customerPayment.dto';
import { DatabaseService } from '../../database/database.service';

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
    private userLoyalHistory: UserLoyaltyHistoryRepository<UserLoyaltyHistoryEntity>,
    private dbService: DatabaseService,
  ) {}

  async create(creator, data: CreateCustomerDto) {
    if (!data.firstname && !data.lastname) {
      throw new HttpException('Tên khách hàng không được để trống', 422);
    }

    const { passwordHash, salt } = saltHashPassword(data.password);

    const user = await this.userRepo.findOne({ phone: data.phone });

    if (user) {
      throw new HttpException('Số điện thoại này đã có trong hệ thống', 409);
    }

    if (data.email) {
      const userEmail = await this.userRepo.findOne({
        email: data.email.trim().toLowerCase(),
      });
      if (userEmail) {
        throw new HttpException('Email đã tồn tại', 409);
      }
    }

    const userData = {
      ...new UserEntity(),
      created_by: creator.user_id,
      ...this.userRepo.setData(data),
      password: passwordHash,
      salt: salt,
      status: UserStatusEnum.Active,
      is_sync: 'N',
    };

    const newUser = await this.userRepo.create(userData);

    let result = { ...newUser };

    data['b_phone'] = data['phone'];
    data['s_phone'] = data['s_phone'] || data['phone'];
    data['b_firstname'] = data['firstname'];
    data['b_lastname'] = data['lastname'];
    data['b_district'] = data['b_district'];
    data['b_city'] = data['b_city'];
    data['b_ward'] = data['b_ward'];
    data['b_address'] = data['b_address'];
    data['s_firstname'] = data['s_firstname'] || data['firstname'];
    data['s_lastname'] = data['s_lastname'] || data['lastname'];
    data['s_district'] = data['s_district'] || data['b_district'];
    data['s_city'] = data['s_city'] || data['b_city'];
    data['s_ward'] = data['s_ward'] || data['b_ward'];
    data['s_address'] = data['s_address'] || data['b_address'];

    const userProfileData = {
      ...new UserProfileEntity(),
      ...this.userProfileRepo.setData(data),
      user_id: result.user_id,
    };

    const newUserProfile = await this.userProfileRepo.create(userProfileData);

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

    return this.createCustomerToAppcore(result);
  }

  async createCustomerToAppcore(user): Promise<void> {
    try {
      const customerAppcoreData = itgCustomerToAppcore(user);

      const response = await axios({
        url: CREATE_CUSTOMER_API,
        method: 'POST',
        data: customerAppcoreData,
      });

      const data = response.data;

      const user_appcore_id = data.data;
      await this.userRepo.update(
        { user_id: user.user_id },
        {
          user_appcore_id,
          updated_at: formatStandardTimeStamp(),
          is_sync: 'Y',
        },
      );
    } catch (error) {
      throw new HttpException(
        error?.response?.data?.message || error.response,
        error?.response?.status || error.status,
      );
    }
  }

  async createCustomerFromWebPayment(data: CreateCustomerPaymentDto) {
    const checkUserExist = await this.userRepo.findOne({ phone: data.s_phone });
    if (checkUserExist) {
      return;
    }
    const customerData = {
      lastname: data.s_lastname,
      b_lastname: data.s_lastname,
      s_lastname: data.s_lastname,
      phone: data.s_phone,
      b_phone: data.s_phone,
      s_phone: data.s_phone,
      b_city: data.s_city,
      s_city: data.s_city,
      b_district: data.s_district,
      s_district: data.s_district,
      b_ward: data.s_ward,
      s_ward: data.s_ward,
      b_address: data.s_address,
      s_address: data.s_address,
    };
    try {
      const { passwordHash, salt } = saltHashPassword(defaultPassword);
      const userData = {
        ...new UserEntity(),
        ...this.userRepo.setData(customerData),
        password: passwordHash,
        salt,
      };

      const user = await this.userRepo.create(userData);

      let result = { ...user };

      const userProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepo.setData(customerData),
        user_id: user['user_id'],
      };
      const userProfile = await this.userProfileRepo.create(userProfileData);

      result = { ...result, ...userProfile };

      const userLoyaltyData = {
        ...new UserLoyaltyEntity(),
        ...this.userLoyalRepo.setData(customerData),
        user_id: user.user_id,
      };
      await this.userLoyalRepo.createSync(userLoyaltyData);

      const userDataData = {
        ...new UserDataEntity(),
        ...this.userDataRepo.setData(customerData),
        user_id: user['user_id'],
      };
      await this.userDataRepo.createSync(userDataData);

      await this.createCustomerToAppcore(result);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getList(params) {
    let {
      page,
      limit,
      search,
      type,
      gender,
      lasted_buy_at_start,
      lasted_buy_at_end,
      created_at_start,
      created_at_end,
      total_purchase_start,
      total_purchase_end,
      total_purchase_amount_start,
      total_purchase_amount_end,
      loyalty_point_start,
      loyalty_point_end,
      order_by_loyalty_point,
    } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    let filterOrders = [
      { field: `${Table.USERS}.updated_at`, sortBy: SortBy.DESC },
    ];
    // Lọc theo loại KH
    if (type) {
      filterConditions[`${Table.USERS}.type`] = type;
    }

    // Lọc theo giới tính
    if (gender) {
      filterConditions[`${Table.USERS}.gender`] = gender;
    }

    // Lọc ngày tạo
    if (created_at_start && created_at_end) {
      filterConditions[`${Table.USERS}.created_at`] = Between(
        created_at_start,
        created_at_end,
      );
    } else if (created_at_start) {
      filterConditions[`${Table.USERS}.created_at`] =
        MoreThanOrEqual(created_at_start);
    } else if (created_at_end) {
      filterConditions[`${Table.USERS}.created_at`] =
        LessThanOrEqual(created_at_start);
    }

    // Lọc ngày mua lần cuối
    if (lasted_buy_at_end && lasted_buy_at_start) {
      filterConditions[`${Table.USERS}.created_at`] = Between(
        lasted_buy_at_start,
        lasted_buy_at_end,
      );
    } else if (lasted_buy_at_start) {
      filterConditions[`${Table.USERS}.created_at`] =
        MoreThanOrEqual(lasted_buy_at_start);
    } else if (lasted_buy_at_end) {
      filterConditions[`${Table.USERS}.created_at`] =
        LessThanOrEqual(lasted_buy_at_end);
    }
    // Lọc tích luỹ
    if (loyalty_point_start && loyalty_point_end) {
      filterConditions[`${Table.USER_LOYALTY}.loyalty_point`] = Between(
        loyalty_point_start,
        loyalty_point_end,
      );
    } else if (loyalty_point_start) {
      filterConditions[`${Table.USER_LOYALTY}.loyalty_point`] =
        MoreThanOrEqual(loyalty_point_start);
    } else if (loyalty_point_end) {
      filterConditions[`${Table.USER_LOYALTY}.loyalty_point`] =
        LessThanOrEqual(loyalty_point_start);
    }

    //Lọc số lần mua
    if (total_purchase_start) {
      filterConditions[`${Table.USER_DATA}.total_purchase`] =
        MoreThanOrEqual(total_purchase_start);
    }
    if (total_purchase_end && total_purchase_end > total_purchase_start) {
      filterConditions[`${Table.USER_DATA}.total_purchase`] =
        MoreThanOrEqual(loyalty_point_end);
    }

    //Lọc tổng lượng mua
    if (total_purchase_amount_start && total_purchase_amount_end) {
      filterConditions[`${Table.USER_DATA}.total_purchase_amount`] = Between(
        total_purchase_amount_start,
        total_purchase_amount_end,
      );
    } else if (total_purchase_amount_start) {
      filterConditions[`${Table.USER_DATA}.total_purchase_amount`] =
        MoreThanOrEqual(total_purchase_amount_start);
    } else if (
      total_purchase_amount_end &&
      total_purchase_amount_end > total_purchase_amount_start
    ) {
      filterConditions[`${Table.USER_DATA}.total_purchase_amount`] =
        MoreThanOrEqual(total_purchase_amount_end);
    }

    if (order_by_loyalty_point) {
      filterOrders = [
        ...filterOrders,
        {
          field: `${Table.USER_PROFILES}.loyalty_point`,
          sortBy: order_by_loyalty_point == -1 ? SortBy.DESC : SortBy.ASC,
        },
      ];
    }

    let count = await this.userRepo.find({
      select: `COUNT(${Table.USERS}.user_id) as total`,
      join: userJoiner,
      where: customersListSearchFilter(search, filterConditions),
    });

    let customersList = await this.userRepo.find({
      select: ['*', `${Table.USERS}.*`],
      join: userJoiner,
      orderBy: [{ field: `${Table.USERS}.updated_at`, sortBy: SortBy.DESC }],
      where: customersListSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : 0,
      },
      customers: customersList,
    };
  }

  async getById(id) {
    let user = await this.userRepo.findOne({
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

    user['creator'] = null;
    if (user['created_by']) {
      const creator = await this.userRepo.findOne({
        select: '*',
        join: creatorJoiner,
        where: { [`${Table.USERS}.user_id`]: user['created_by'] },
      });

      user['creator'] = preprocessUserResult(creator);
    }

    return formatCustomerTimestamp(user);
  }

  async getCustomerLoyaltyHistory(id, params) {
    const user = await this.userRepo.findOne({ user_id: id });
    if (!user) {
      throw new HttpException('Không tìm thấy khách hàng.', 404);
    }

    let { page, limit, search } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    const userLoyaltyHistory = await this.userLoyalHistory.find({
      select: '*',
      orderBy: [
        {
          field: `${Table.USER_LOYALTY_HISTORY}.created_at`,
          sortBy: SortBy.DESC,
        },
      ],
      where: { [`${Table.USER_LOYALTY_HISTORY}.user_id`]: id },
      skip,
      limit,
    });

    const count = await this.userLoyalHistory.find({
      select: '*',
      orderBy: [
        {
          field: `${Table.USER_LOYALTY_HISTORY}.created_at`,
          sortBy: SortBy.DESC,
        },
      ],
      where: { [`${Table.USER_LOYALTY_HISTORY}.user_id`]: id },
      skip,
      limit,
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      loyaltyHistories: userLoyaltyHistory,
    };
  }

  async update(user_id: string, data: UpdateCustomerDTO) {
    const user = await this.userRepo.findOne({ user_id });

    if (!user) {
      throw new HttpException('Không tìm thấy người dùng.', 404);
    }
    if (data.email) {
      if (user.email && data.email !== user.email) {
        throw new HttpException('Không thể cập nhật email', 403);
      }
      const userEmail = await this.userRepo.findOne({ email: data.email });
      if (userEmail) {
        throw new HttpException('Email đã tồn tại', 403);
      }
    }

    let result = { ...user };
    if (data['birthday']) {
      data['birthday'] = formatStandardTimeStamp(data['birthday']);
    }

    const userData = {
      ...this.userRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };

    const updatedUser = await this.userRepo.update({ user_id }, userData);
    result = { ...result, ...updatedUser };

    const userProfileData = this.userProfileRepo.setData(data);
    if (Object.entries(userProfileData).length) {
      const updatedUserProfile = await this.userProfileRepo.update(
        { user_id: result.user_id },
        userProfileData,
      );
      result = { ...result, ...updatedUserProfile };
    }

    if (data.loyalty_point) {
      const userLoyal = await this.userRepo.findOne({ user_id: user.user_id });
      if (!userLoyal) {
        const newUserLoyal = await this.userLoyalRepo.create({
          user_id: user.user_id,
          loyalty_point: data.loyalty_point,
          created_at: formatStandardTimeStamp(),
          updated_at: formatStandardTimeStamp(),
        });
        result['loyalty'] = newUserLoyal;
      } else {
        const updatedUserLoyal = await this.userLoyalRepo.update(
          {
            user_id: user.user_id,
          },
          {
            loyalty_point: data.loyalty_point,
          },
        );
        result['loyalty'] = updatedUserLoyal;
      }
    }

    const userDataData = this.userDataRepo.setData(data);
    if (Object.entries(userDataData).length) {
      const updatedUserData = await this.userDataRepo.update(
        { user_id: result.user_id },
        userDataData,
      );
      result = { ...result, ...updatedUserData };
    }

    await this.updateCustomerToAppcore(result);
  }

  async updateCustomerToAppcore(customer) {
    try {
      const customerDataToAppcore = itgCustomerToAppcore(customer);

      await axios({
        url: `${CREATE_CUSTOMER_API}/${customer.user_appcore_id}`,
        method: 'PUT',
        data: customerDataToAppcore,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Cập nhật tới Appcore không thành công', 400);
    }
  }

  async syncGet() {
    try {
      const response = await axios({
        url: `${GET_CUSTOMERS_API}?page=5`,
      });

      const { passwordHash, salt } = saltHashPassword(defaultPassword);
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

  async itgGet(user_appcore_id: number) {
    const customer = await this.userRepo.findOne({
      select: '*',
      join: userJoiner,
      where: { [`${Table.USERS}.user_appcore_id`]: user_appcore_id },
    });
    if (!customer) {
      throw new HttpException(
        `Không tìm thấy KH có appcore id : ${user_appcore_id}`,
        404,
      );
    }

    return customer;
  }

  async itgCreate(data: CreateCustomerAppcoreDto) {
    let convertedData = itgCreateCustomerFromAppcore(data);

    const userAppcore = await this.userRepo.findOne({
      user_appcore_id: convertedData['user_appcore_id'],
    });
    if (userAppcore) {
      throw new HttpException('Người dùng đã tồn tại trong hệ thống', 409);
    }

    const { passwordHash, salt } = saltHashPassword(defaultPassword);
    let result;
    const user = await this.userRepo.findOne({ phone: data.phone });
    if (user) {
      const userData = this.userRepo.setData(convertedData);
      const updatedUser = await this.userRepo.update(
        { phone: data.phone },
        userData,
      );
      result = { ...updatedUser };
    } else {
      const userData = {
        ...new UserEntity(),
        ...this.userRepo.setData(convertedData),
        password: passwordHash,
        salt: salt,
        status: UserStatusEnum.Deactive,
      };

      const newUser = await this.userRepo.create(userData);

      result = { ...newUser };
    }

    let userProfile = await this.userProfileRepo.findOne({
      user_id: result.user_id,
    });
    if (userProfile) {
      const updatedUserProfileData =
        this.userProfileRepo.setData(convertedData);
      if (Object.entries(updatedUserProfileData).length) {
        await this.userProfileRepo.update(
          { user_id: result.user_id },
          updatedUserProfileData,
        );
      }
    } else {
      const userProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepo.setData(convertedData),
        user_id: result.user_id,
      };
      await this.userProfileRepo.create(userProfileData);
    }

    let userData = await this.userDataRepo.findOne({ user_id: result.user_id });
    if (userData) {
      const updatedUserDataData = this.userDataRepo.setData(convertedData);
      if (Object.entries(updatedUserDataData).length) {
        await this.userDataRepo.update(
          { user_id: result.user_id },
          updatedUserDataData,
        );
      }
    } else {
      const userDataData = {
        ...new UserDataEntity(),
        ...this.userDataRepo.setData(convertedData),
        user_id: result.user_id,
      };
      await this.userDataRepo.create(userDataData);
    }

    let userLoyalty = await this.userLoyalRepo.findOne({
      user_id: result.user_id,
    });
    if (userLoyalty) {
      const updatedUserLoyaltyData = this.userLoyalRepo.setData(convertedData);
      if (Object.entries(updatedUserLoyaltyData).length) {
        await this.userLoyalRepo.update(
          { user_id: result.user_id },
          updatedUserLoyaltyData,
        );
      }
    } else {
      const userLoyaltyData = {
        ...new UserLoyaltyEntity(),
        ...this.userLoyalRepo.setData(convertedData),
        user_id: result.user_id,
      };

      await this.userLoyalRepo.create(userLoyaltyData);
    }

    return result;
  }

  async itgUpdate(user_appcore_id: number, data: UpdateCustomerAppcoreDto) {
    const convertedData = itgUpdateCustomerFromAppcore(data);

    const user = await this.userRepo.findOne({
      user_appcore_id,
    });

    if (!user) {
      throw new HttpException('Không tìm thấy user trong hệ thống.', 404);
    }

    if (convertedData['email']) {
      const userEmail = await this.userRepo.findOne({
        email: data.email,
        user_appcore_id: Not(Equal(user_appcore_id)),
      });
      if (userEmail) {
        throw new HttpException('Email đã tồn tại', 409);
      }
    }

    let result = { ...user };

    const userData = this.userRepo.setData(convertedData);

    if (Object.entries(userData).length) {
      const updatedUser = await this.userRepo.update(
        { user_id: result.user_id },
        { ...userData, updated_at: formatStandardTimeStamp() },
      );
      result = { ...updatedUser };
    }

    let userProfile = await this.userProfileRepo.findOne({
      user_id: result.user_id,
    });
    if (userProfile) {
      const userProfileData = this.userProfileRepo.setData(convertedData);
      if (Object.entries(userProfileData).length) {
        const updatedUserProfile = await this.userProfileRepo.update(
          { user_id: result.user_id },
          userProfileData,
        );
        result = { ...result, ...updatedUserProfile };
      }
    } else {
      const newUserProfileData = {
        ...new UserProfileEntity(),
        ...this.userProfileRepo.setData(convertedData),
        user_id: result.user_id,
      };
      await this.userProfileRepo.create(newUserProfileData);
    }

    let _userData = await this.userDataRepo.findOne({
      user_id: result.user_id,
    });
    if (_userData) {
      const userDataData = this.userDataRepo.setData(convertedData);

      if (Object.entries(userDataData).length) {
        const updatedUserData = await this.userDataRepo.update(
          { user_id: result.user_id },
          userDataData,
        );
        result = { ...result, ...updatedUserData };
      }
    } else {
      const newUserDataData = {
        ...new UserDataEntity(),
        ...this.userDataRepo.setData(convertedData),
        user_id: result.user_id,
      };
      await this.userDataRepo.create(newUserDataData);
    }

    const userLoyalty = await this.userLoyalRepo.findOne({
      user_id: result.user_id,
    });
    if (userLoyalty) {
      const userLoyaltyData = this.userLoyalRepo.setData(convertedData);

      if (Object.entries(userLoyaltyData).length) {
        const updatedUserLoyalty = await this.userLoyalRepo.update(
          { user_id: result.user_id },
          userLoyaltyData,
        );
        result = { ...result, ...updatedUserLoyalty };
      }
    } else {
      const newUserLoyaltyData = {
        ...new UserLoyaltyEntity(),
        ...this.userLoyalRepo.setData(convertedData),
        user_id: result.user_id,
      };
      await this.userLoyalRepo.create(newUserLoyaltyData);
    }

    return result;
  }

  async itgUpdateLoyalty(user_appcore_id: number, data: UpdateCustomerLoyalty) {
    const customer = await this.userRepo.findOne({ user_appcore_id });
    if (!customer) {
      throw new HttpException('Không tìm thấy Khách hàng trong hệ thống', 404);
    }
    const customerLoyalty = await this.userLoyalRepo.findOne({
      user_id: customer.user_id,
    });
    if (!customerLoyalty) {
      const customerLoyaltyData = {
        ...new UserLoyaltyEntity(),
        loyalty_point: data.loyalty_point,
        user_id: customer.user_id,
      };
      await this.userLoyalRepo.createSync(customerLoyaltyData);
      return;
    }

    await this.userLoyalRepo.update(
      { user_id: customer.user_id },
      {
        loyalty_point: data.loyalty_point,
        updated_at: formatStandardTimeStamp(),
      },
    );
  }

  async clearAll() {
    const customersList = await this.userRepo.find({
      select: '*',
      where: { user_type: 'C' },
    });
    if (customersList.length) {
      for (let customer of customersList) {
        await this.userRepo.delete({ user_id: customer.user_id });
        await this.userProfileRepo.delete({ user_id: customer.user_id });
        await this.userDataRepo.delete({ user_id: customer.user_id });
        await this.userLoyalRepo.delete({ user_id: customer.user_id });
      }
    }
  }

  async itgPostLoyalty(customer_appcore_id: string, point: number) {
    const user = await this.userRepo.findOne({
      user_appcore_id: customer_appcore_id,
    });

    if (!user) {
      return;
    }

    await this.userRepo.update(
      {
        user_id: user['user_id'],
      },
      {
        updated_at: formatStandardTimeStamp(),
      },
    );

    const userLoyalty = await this.userLoyalRepo.findOne({
      user_id: user.user_id,
    });

    if (userLoyalty) {
      await this.userLoyalRepo.update(
        { user_id: user.user_id },
        { loyalty_point: point },
      );
    } else {
      const newUserLoyalty = {
        ...new UserLoyaltyEntity(),
        loyalty_point: point,
        user_id: user.user_id,
      };
      await this.userLoyalRepo.create(newUserLoyalty);
    }
  }

  async itgPostLoyaltyHistory(
    customer_appcore_id,
    data: CreateCustomerLoyalHistoryDto,
  ) {
    const user = await this.userRepo.findOne({
      user_appcore_id: customer_appcore_id,
    });

    if (!user) {
      return;
    }

    const userLoyalHist = {
      ...new UserLoyaltyHistoryEntity(),
      ...this.userLoyalHistory.setData(data),
      user_id: user.user_id,
    };
    await this.userLoyalHistory.create(userLoyalHist);

    const loyaltyHistoriesList = await this.userLoyalHistory.find({
      select: '*',
      where: { user_id: user.user_id },
    });

    if (loyaltyHistoriesList.length) {
      let total = 0;
      for (let loyaltyHistory of loyaltyHistoriesList) {
        if (loyaltyHistory['by_type'] == 'A') {
          total += loyaltyHistory['point'];
        } else {
          total -= loyaltyHistory['point'];
        }
      }

      await this.userLoyalRepo.update(
        { user_id: user.user_id },
        { loyalty_point: total },
      );
    }
  }

  async importCustomers() {
    let totalPage = 1000;
    let limitPerPage = 30;
    try {
      for (let page = 71; page < totalPage; page++) {
        const response = await axios({
          url: IMPORT_CUSTOMERS_API(page, limitPerPage),
          headers: {
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6MzAwMDA3OCwidXNlcm5hbWUiOiJuaGF0dGluX3ZpZXciLCJpc0FjdGl2ZSI6dHJ1ZSwibGlzdEZlYXR1cmUiOlsiUE9JTlRfVklFVyIsIk9SREVSX1ZJRVciLCJQUk9EVUNUX0FUVEFDSF9WSUVXIiwiVFJBREVfSU5fVklFVyIsIlBST0RVQ1RfUFJPTU9USU9OX1ZJRVciLCJESVNDT1VOVF9WSUVXIiwiVFJBREVfSU5fUFJPR1JBTV9WSUVXIiwiQ09VUE9OX1ZJRVciLCJWSVJUVUFMX1NUT0NLX1ZJRVciLCJPUkRFUl9JTlNFUlQiLCJUUkFERV9JTl9JTlNFUlQiLCJESVNDT1VOVF9JTlNFUlQiLCJDT1VQT05fSU5TRVJUIiwiUFJPRFVDVF9QUk9NT1RJT05fSU5TRVJUIiwiVFJBREVfSU5fUFJPR1JBTV9JTlNFUlQiLCJQUk9EVUNUX0FUVEFDSF9JTlNFUlQiLCJBUkVBX1ZJRVciLCJSRUdJT05fVklFVyIsIkNVU1RPTUVSX0NBUkVfVklFVyIsIkNVU1RPTUVSX0NBUkVfSU5TRVJUIiwiUE9JTlRfSU5TRVJUIiwiT1JERVJfVVBEQVRFIiwiVFJBREVfSU5fVVBEQVRFIiwiSU5TVEFMTE1FTlRfVklFVyIsIklOU1RBTExNRU5UX0lOU0VSVCIsIlZJUlRVQUxfU1RPQ0tfSU5TRVJUIiwiV0FSUkFOVFlfSU5TRVJUIiwiV0FSUkFOVFlfVklFVyIsIlNUT1JFX1ZJRVciLCJDVVNUT01FUl9WSUVXIiwiQ0FURV9WSUVXIiwiQ0FURV9JTlNFUlQiLCJCUkFORF9WSUVXIiwiQlJBTkRfSU5TRVJUIiwiUFJPVklERVJfVklFVyIsIlBST1ZJREVSX0lOU0VSVCIsIlBST1BFUlRZX1ZJRVciLCJQUk9EVUNUX1ZJRVciLCJQUk9QRVJUWV9JTlNFUlQiLCJCSUxMX1ZJRVciLCJQUk9EVUNUX0lOU0VSVCIsIkJJTExfSU5TRVJUIiwiQklMTF9VUERBVEUiXSwiZW1wbG95ZWVJZCI6MzAwMDE3NSwiam9iVGl0bGVJZCI6bnVsbH0sImlhdCI6MTY0ODMxMzExOSwiZXhwIjoxNjQ4OTE3OTE5fQ.j0oPSscd79UJfJYpnDqoShBUzAJcY2X3m3iM1RI0fsE',
          },
        });

        if (!response?.data?.data?.dataset) {
          continue;
        }
        const customersList = response.data.data.dataset;
        for (let customer of customersList) {
          let convertedData = importCustomersFromAppcore(customer);
          if (!convertedData['phone']) {
            continue;
          }
          await this.createCustomerTemplate(convertedData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createCustomerTemplate(customer) {
    const newCustomerData = {
      ...new UserEntity(),
      ...this.userRepo.setData(customer),
    };
    const newCustomer = await this.userRepo.create(newCustomerData);
    const newCustomerProfileDesc = {
      ...new UserProfileEntity(),
      ...this.userProfileRepo.setData(customer),
      user_id: newCustomer.user_id,
    };
    await this.userProfileRepo.createSync(newCustomerProfileDesc);
    const newCustomerLoyaltyData = {
      ...new UserLoyaltyEntity(),
      ...this.userLoyalRepo.setData(customer),
      user_id: newCustomer.user_id,
    };
    await this.userLoyalRepo.createSync(newCustomerLoyaltyData);
    const newCustomerDataData = {
      ...new UserDataEntity(),
      ...this.userDataRepo.setData(customer),
      user_id: newCustomer.user_id,
    };
    await this.userDataRepo.createSync(newCustomerDataData);
  }
}
