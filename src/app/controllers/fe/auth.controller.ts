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
import { AuthService } from '../../services/auth.service';
import { AuthCredentialsDto } from '../../dto/auth/auth-credential.dto';
import { AuthUpdatePasswordDto } from '../../dto/auth/auth-update-password.dto';
import { IResponse } from '../../interfaces/response.interface';
import { AuthLoginProviderDto } from '../../dto/auth/auth-login-provider.dto';
import { LoginDto } from '../../dto/auth/auth-login.dto';
import { BaseController } from '../../../base/base.controllers';
import { Response } from 'express';
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
    const fullUrl = req.protocol + '://' + req.get('host');
    const { email } = req.body;

    await this.service.resetPasswordByEmail(fullUrl, email);
    return this.responseSuccess(
      res,
      null,
      `request to reset password success, please visit to email to activate new password`,
    );
  }

  /**
   * User visit to his / her email, then click verify link which server send before. At this time, server will check query URL including token and user_id and token_exp.
   * If everything is ok, server will render new password form in order to user enable to fill in it
   * If everything is bad, server will raise error immediately
   * @param req
   * @param res
   */
  @Get('forgot-password')
  async restorePasswordByEmail(@Req() req, @Res() res): Promise<void> {
    const { token, user_id } = req.query;
    await this.service.restorePasswordByEmail(user_id, token);
    res.render('forgot-password-form');
  }

  /**
   * @Describe When user submit password form, server will received user_id, token and password
   * Next, server will find user by user_id, token
   * If finding user, server will compare now time with verify_token_expiration
   * Server will perform update new password, remove verify token
   * @param authRestoreDto {user_id : number; token : string; password : stringh}
   * @param res
   * @returns
   */
  @Put('update-password-by-email')
  async updatePasswordByEmail(
    @Body() authRestoreDto: AuthUpdatePasswordDto,
    @Res() res,
  ): Promise<IResponse> {
    const { user_id, token, password } = authRestoreDto;

    await this.service.updatePasswordByEmail(user_id, token, password);

    return this.responseSuccess(res, null, `updated`);
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
