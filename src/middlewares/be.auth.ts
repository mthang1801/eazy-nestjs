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
import { desaltHashPassword } from '../utils/cipherHelper';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {} //reflect roles of user
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    const authoriazationToken = req.headers?.authorization;

    if (!authoriazationToken) {
      throw new HttpException(
        'Yêu cầu truy cập bị từ chối.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authoriazationToken.split(' ').slice(-1)[0];
    const decoded = jwt.verify(
      token,
      this.configService.get<string>('jwtSecretKey'),
    );

    const user = decoded?.sub;

    if (!user || !user['user_id'] || !user['salt']) {
      throw new HttpException('Token không hợp lệ.', HttpStatus.UNAUTHORIZED);
    }

    if (+decoded['exp'] * 1000 - Date.now() < 0) {
      throw new HttpException('Token đã hết hạn.', 408);
    }
    console.log(user['user_id']);
    console.log(desaltHashPassword(user['user_id'], user['salt']));

    req.user = user;

    return true;
  }
}
