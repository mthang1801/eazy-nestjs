import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {} //reflect roles of user
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

    const token = authoriazationToken.split(' ').slice(-1)[0].trim();

    const decoded = jwt.verify(
      token,
      this.configService.get<string>('jwtSecretKey'),
    );

    if (!decoded || +decoded['exp'] * 1000 - Date.now() < 0) {
      throw new HttpException('Token không hợp lệ hoặc đã hết hạn.', 408);
    }
    const user = decoded?.sub;

    if (!user || !user['user_id']) {
      throw new HttpException('Token không hợp lệ.', HttpStatus.UNAUTHORIZED);
    }

    req.user = user;

    return true;
  }
}
