import { Controller, Post } from '@nestjs/common';
import { BaseController } from '../../base/base.controllers';

@Controller('auth')
export class AuthenticationController extends BaseController {}
