import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Table, JoinTable } from '../../database/enums/index';

import { Like } from 'typeorm';
import { UsersService } from './users.service';


@Injectable()
export class CustomerService {
    constructor(
        private usersService: UsersService,
    ) { }
    async getList(params) {
        //=====Filter param
        const users = await this.usersService.findUsersAllInfo({[`${Table.USERS}.user_type`]:'C'})
        console.log(users);
        return users
    }
}
