import { UserRepository } from '../repositories/user.repository';
import { DatabaseService } from '../database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class User {
  constructor(private user: UserRepository) {}
  get User() {
    return this.user;
  }
}
