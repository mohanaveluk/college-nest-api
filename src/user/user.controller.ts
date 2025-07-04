import { 
  Controller, 
  Post, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  Put,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Req
} from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
  } from '@nestjs/swagger';
  import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOTCDto } from './dto/resend-otc.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto';
import { Public } from '../common/decorators/public.decorator';

  
  @ApiTags('users')
  @Controller('users')
  @Public()
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Put('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(
      @User('guid') userGuid: string,
      @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.updateProfile(userGuid, updateProfileDto);
        return new ResponseDto(true, 'Profile updated successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to update profile', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Put('profile-image')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiOperation({ summary: 'Update profile image' })
    async updateProfileImage(
      @User('guid') userGuid: string,
      @UploadedFile() file: Express.Multer.File,
    ): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.updateProfileImage(userGuid, file);
        return new ResponseDto(true, 'Profile image updated successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to update profile image', null, error.message),
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
      return this.userService.getUserInfo(req.user.guid);
    }

  
    @Get()
    @Roles(UserRole.User)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Get all users' })
    async getAllUsers(): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.getAllUsers();
        return new ResponseDto(true, 'Users retrieved successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to retrieve users', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Get(':guid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user by GUID' })
    async getUserByGuid(@Param('guid') guid: string): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.getUserByGuid(guid);
        return new ResponseDto(true, 'User retrieved successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to retrieve user', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Put(':guid/toggle-status')
    @Roles(UserRole.Admin)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Toggle user status' })
    async toggleUserStatus(@Param('guid') guid: string): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.toggleUserStatus(guid);
        return new ResponseDto(true, 'User status updated successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to update user status', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Put('password')
    @ApiOperation({ summary: 'Update password' })
    async updatePassword(
      @User('guid') userGuid: string,
      @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.updatePassword(userGuid, updatePasswordDto);
        return new ResponseDto(true, 'Password updated successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to update password', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('password-reset/request')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - invalid email' })
    async requestPasswordReset(@Body('email') email: string): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.requestPasswordReset(email);
        return new ResponseDto(true, 'Password reset code sent successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to send reset code', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.resetPassword(resetPasswordDto);
        return new ResponseDto(true, 'Password reset successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to reset password', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('send-code')
    @ApiOperation({ summary: 'Send one-time code' })
    async sendOneTimeCode(@User('guid') userGuid: string): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.sendOneTimeCode(userGuid);
        return new ResponseDto(true, 'One-time code sent successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to send one-time code', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('validate-code')
    @ApiOperation({ summary: 'Validate one-time code' })
    async validateOneTimeCode(
      @User('guid') userGuid: string,
      @Body('code') code: string,
    ): Promise<ResponseDto<any>> {
      try {
        const result = await this.userService.validateOneTimeCode(userGuid, code);
        return new ResponseDto(true, 'Code validated successfully', result, null);
      } catch (error) {
        throw new HttpException(
          new ResponseDto(false, 'Failed to validate code', null, error.message),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    
    @Post('resendotc')
    @ApiOperation({ summary: 'Send OTC to mobile number' })
    @ApiResponse({ status: 200, description: 'OTC sent successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
    async resendVerificationCode(@Body() resendOTCDto: ResendOTCDto) {
      return this.userService.resendVerificationCode(resendOTCDto);
    }

    
    // @Post('update-password')
    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth('JWT-auth')
    // @ApiOperation({ summary: 'Update user password' })
    // @ApiResponse({ status: 200, description: 'Password updated successfully' })
    // @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
    // updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    //   return this.userService.updatePassword(req.user.id, updatePasswordDto);
    // }


    

    @Get("roles")
    @Roles(UserRole.Admin)
    @ApiOperation({ summary: 'Get all roles' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns all roles',
      type: [User]
    })
    // @ApiResponse({ 
    //   status: 401, 
    //   description: 'Unauthorized' 
    // })
    @ApiResponse({ 
      status: 500, 
      description: 'Internal server error' 
    })
    @Public()
    async getRoles() {
      return this.userService.findAllRoles();
    }

    
    @Get("users")
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns all users',
      type: [User]
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Unauthorized' 
    })
    @ApiResponse({ 
      status: 500, 
      description: 'Internal server error' 
    })
    async getUsers() {
      return this.userService.getAllUsers();
    }

    @Put(':uguid')
    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({ 
      status: 200, 
      description: 'User updated successfully',
      type: User
    })
    @ApiResponse({ 
      status: 400, 
      description: 'Invalid input' 
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Unauthorized' 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
    async updateUser(
      @Param('uguid') uguid: string,
      @Body() updateUserDto: UpdateUserDto
    ) {
      return this.userService.updateUser(uguid, updateUserDto);
    }

   
  }