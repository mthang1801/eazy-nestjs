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
import { preprocessUserResult } from 'src/utils/helper';

@Injectable()
export class CustomerService {
  constructor(
    private usersService: UsersService,
    private userRepo: UserRepository<UserEntity>,
    private userProfileRepo: UserProfileRepository<UserProfileEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
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
        [`${Table.USERS}.user_type`]: customer_type.map((type) => type),
      },
    });
    if (!user) {
      throw new HttpException('Không tìm thấy customer', 404);
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
  async update(id, data: UpdateCustomerDTO) {
    const users = await this.usersService.updateProfilebyAdmin(id, data);
    return users;
  }
}
