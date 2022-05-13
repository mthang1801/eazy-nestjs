import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { desaltHashPassword, decodeBase64String } from '../utils/cipherHelper';
import { RoleService } from '../app/services/role.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly roleService: RoleService,
  ) {} //reflect roles of user
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authorizationUUID = req.headers['x-auth-uuid'];

    if (!authorizationUUID) {
      throw new HttpException('Yêu cầu truy cập bị từ chối.', 401);
    }

    const authoriazationToken = req.headers?.authorization;

    if (!authoriazationToken) {
      throw new HttpException('Yêu cầu truy cập bị từ chối.', 401);
    }

    const token = authoriazationToken.split(' ').slice(-1)[0];
    const decoded = jwt.verify(
      token,
      this.configService.get<string>('jwtSecretKey'),
    );

    const user = decoded?.sub;

    if (!user || !user['user_id']) {
      throw new HttpException('Token không hợp lệ.', HttpStatus.UNAUTHORIZED);
    }

    if (+decoded['exp'] * 1000 - Date.now() < 0) {
      throw new HttpException('Token đã hết hạn.', 408);
    }

    if (user['user_id'] !== authorizationUUID) {
      throw new HttpException('Yêu cầu truy cập bị từ chối.', 401);
    }

    const userId = decodeBase64String(user['user_id']).split('-')[5];
    user['user_id'] = userId;

    let {
      method,
      route: { path },
    } = req;

    try {
      const result: boolean = await this.roleService.checkUserRole(
        userId,
        method,
        path,
      );
      if (!result) {
        throw new HttpException('Yêu cầu truy cập bị từ chối.', 401);
      }
    } catch (error) {
      throw new HttpException('Yêu cầu truy cập bị từ chối.', 401);
    }

    req.user = user;

    return true;
  }
}
