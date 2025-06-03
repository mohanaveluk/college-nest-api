import { Controller, Post, Body, Get, Query, UseGuards, HttpException, HttpStatus, Req, Param, UseInterceptors, Request, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import { VerifyEmailDto } from 'src/user/dto/verify-email.dto';
import { Request as ExpRequest } from 'express';
import { Constants } from 'src/shared/constants/constants';
import { ApiErrorDto } from 'src/shared/dto/api-error.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { maxFileSize } from 'src/shared/utils/file-validation.util';
import { RequestPasswordResetDto } from 'src/user/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/user/dto/reset-password.dto';
import { UpdateProfileDto } from 'src/user/dto/update-profile.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 401,
    description: Constants.AUTH.UN_AUTHORIZED,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: Constants.SWAGGER.BAD_REQUEST,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 406,
    description: Constants.SWAGGER.NOT_ACCEPT,
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: Constants.SWAGGER.INTERNAL_SERVER_ERROR,
    type: ApiErrorDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<any>> {
    try {
      const result = await this.authService.register(registerDto);
      return new ResponseDto(true, 'User registered successfully', result, null);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, error.message, null, `Failed to register user - ${error.message}`),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.uguid, updateProfileDto);
  }
  
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto, @Req() req: ExpRequest): Promise<ResponseDto<any>> {
    try {
      const result = await this.authService.login(loginDto, req);
      return new ResponseDto(true, 'Login successful', result, null);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, error.message, null, error.message),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<ResponseDto<any>> {
    try {
      const result = await this.authService.verifyEmail(verifyEmailDto);
      return new ResponseDto(true, 'Email verified successfully', result, null);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Email verification failed', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@User('uguid') userGuid: string): Promise<ResponseDto<any>> {
    try {
      const result = await this.authService.logout(userGuid);
      return new ResponseDto(true, 'Logout successful', result, null);
    } catch (error) {
      throw new HttpException(
        new ResponseDto(false, 'Logout failed', null, error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async userProfile(
    @Request() req: any,
  ) {
    return this.authService.getUserInfo(req.user.uguid);
  }


  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: maxFileSize }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.authService.uploadProfileImage(req.user.uguid, file);
  }

  @Post('password-reset/request')
  @Public()
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid email' })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('password-reset/reset')
  @Public()
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }


  @Get('verify-email/:token')
  @Public()
  @ApiOperation({ summary: 'Verify email using token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid or expired token' })
  async verifyEmailToken(@Param('token') token: string) {
    return this.authService.verifyEmailToken(token);
  }
}