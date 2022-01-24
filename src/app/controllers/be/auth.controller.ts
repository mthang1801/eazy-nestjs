import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { AuthCredentialsDto } from '../../dto/auth/auth-credential.dto';
import { IResponse } from '../../interfaces/response.interface';
import { LoginDto } from '../../dto/auth/auth-login.dto';
import { BaseController } from '../../../base/base.controllers';
/**
 * Authentication controller
 * @Describe Using 3 authenticate types : Local, Google, Facebook
 * @Author MvThang
 */
@Controller('/be/v1/auth')
export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }
  /**
   * Register account with email or phone and password from BE
   * @param authCredentialsDto
   * @param res
   * @returns
   */
  @Post('register')
  @UsePipes(ValidationPipe)
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res() res,
  ): Promise<IResponse> {
    const userResponse = await this.authService.signUp(authCredentialsDto);
    return this.respondCreated(res, userResponse);
  }

  /**
   * Login account with email or phone and password from BE
   * @param data
   * @param res
   * @returns
   */
  @Post('login')
  async login(@Body() data: LoginDto, @Res() res): Promise<IResponse> {
    const userResponse = await this.authService.login(data);
    return this.responseSuccess(res, userResponse);
  }
}
