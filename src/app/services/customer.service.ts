import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Table, JoinTable } from '../../database/enums/index';

import { Like } from 'typeorm';
import { UsersService } from './users.service';
import { UpdateCustomerDTO } from '../dto/customer/update-customer.dto';


@Injectable()
export class CustomerService {
    constructor(
        private usersService: UsersService,
    ) { }
    async getList(params) {
        //=====Filter param
        const users = await this.usersService.findUsersAllInfo({[`${Table.USERS}.user_type`]:'C'})
        return users
    }
    async getById(id){
        const users = await this.usersService.findUsersAllInfo({[`${Table.USERS}.user_type`]:'C'
        ,[`${Table.USERS}.user_id`]:id})
        return users
    }
    async update(id,data:UpdateCustomerDTO){
        const users= await this.usersService.updateProfilebyAdmin(id,data);
        return users
    }
}
