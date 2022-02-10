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

    if (!user) {
      throw new HttpException('Token không hợp lệ.', HttpStatus.UNAUTHORIZED);
    }

    if (+decoded['exp'] * 1000 - Date.now() < 0) {
      throw new HttpException('Token đã hết hạn.', 408);
    }

    // Compare privilege with user menu
    let {
      method,
      route: { path },
    } = req;

    req.user = user;
    const menu = user['menu'];

    let isAllowed = false;
    if (menu && menu?.length) {
      for (let menuItem of menu) {
        if (
          menuItem.privilege === path &&
          menuItem.method.toUpperCase() === method.toUpperCase()
        ) {
          isAllowed = true;
          break;
        }
        if (menuItem.children && menuItem.children.length) {
          for (let childMenuItem of menuItem.children) {
            if (
              childMenuItem.privilege === path &&
              childMenuItem.method.toUpperCase() === method.toUpperCase()
            ) {
              isAllowed = true;
              break;
            }
          }
        }
        if (isAllowed) {
          break;
        }
      }
    }
    if (!isAllowed) {
      throw new HttpException(
        'Không thể truy cập vào đường dẫn này.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
