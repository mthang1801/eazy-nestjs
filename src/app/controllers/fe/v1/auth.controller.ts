import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
} from '@nestjs/common';
import { AuthService } from '../../../services/auth.service';
import { AuthCredentialsDto } from '../../../dto/auth/auth-credential.dto';
import { AuthUpdatePasswordDto } from '../../../dto/auth/auth-updatePassword.dto';
import { IResponse } from '../../../interfaces/response.interface';
import { AuthLoginProviderDto } from '../../../dto/auth/auth-loginProvider.dto';
import { LoginDto } from '../../../dto/auth/auth-login.dto';
import { BaseController } from '../../../../base/base.controllers';
import { Response } from 'express';
import { AuthRestoreDto } from '../../../dto/auth/auth-restore.dto';
/**
 * Authentication controller
 * @Describe Using 3 authenticate types : Local, Google, Facebook
 * @Author MvThang
 */
@Controller('/fe/v1/auth')
export class AuthController extends BaseController {
  constructor(private service: AuthService) {
    super();
  }

  /**
   *  Register account with email or phone and password from FE
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
    await this.service.signUp(authCredentialsDto);
    return this.responseSuccess(
      res,
      null,
      'Đăng ký tài khoản thành công, vui lòng truy cập vào email để kích hoạt tài khoản',
    );
  }

  /**
   * Login account with email or phone and password from FE
   * @param data
   * @param res
   * @returns
   */
  @Post('login')
  async login(@Body() data: LoginDto, @Res() res): Promise<IResponse> {
    const userResponse = await this.service.login(data);
    return this.responseSuccess(res, userResponse);
  }

  @Get()
  async getAuth(@Res() res) {
    res.render('home-test');
  }

  /**
   * Login with Google provider
   * @param AuthLoginProviderDto
   * @param res
   * @returns
   */
  @Post('/google/login')
  async loginWithGoolge(
    @Body() AuthLoginProviderDto: AuthLoginProviderDto,
    @Res() res,
  ): Promise<IResponse> {
    const userResponse = await this.service.loginWithGoogle(
      AuthLoginProviderDto,
    );
    return this.responseSuccess(res, userResponse);
  }

  /**
   * Login with Facebook provider
   * @param AuthLoginProviderDto
   * @param res
   * @returns
   */
  @Post('facebook/login')
  async loginWithFacebook(
    @Body() AuthLoginProviderDto: AuthLoginProviderDto,
    @Res() res,
  ): Promise<IResponse> {
    const userResponse = await this.service.loginWithFacebook(
      AuthLoginProviderDto,
    );
    return this.responseSuccess(res, userResponse);
  }

  /**
   * @Describe When user click reset or forget passwrod button, this request will send to server. Place to receive is here.
   * Server will verify if the email has been existing. Then it will create verify token and token expiration, then send the restore password url to user through this email.
   * @param req
   * @param res
   * @returns
   */
  @Post('reset-password-by-email')
  async resetPasswordByEmail(@Req() req, @Res() res): Promise<IResponse> {
    const { email } = req.body;

    await this.service.resetPasswordByEmail(email);
    return this.responseSuccess(
      res,
      null,
      `Yêu cầu reset password thành công, vui lòng kiểm tra email để kích hoạt lại tài khoản.`,
    );
  }

  @Post('restore-password')
  async restorePassword(
    @Body() data: AuthRestoreDto,
    @Res() res: Response,
  ): Promise<IResponse> {
    const result = await this.service.restorePasswordEmail(data);
    return this.responseSuccess(res, result, 'Khôi phục mật khẩu thành công');
  }

  @Get('active')
  async activeSignUpAccount(
    @Query('user_id') user_id: number,
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    const userDataRes = await this.service.activeSignUpAccount(user_id, token);
    return this.responseSuccess(
      res,
      userDataRes,
      'Kích hoạt tài khoản thành công.',
    );
  }

  @Post('reactivate')
  async reactivateSignUpAccount(
    @Body('user_id') user_id: string,
    @Res() res: Response,
  ): Promise<IResponse> {
    await this.service.reactivateSignUpAccount(user_id);
    return this.responseSuccess(
      res,
      null,
      'Yêu cầu kích hoạt lại tài khoản thành công, vui lòng kiểm tra email.',
    );
  }
}