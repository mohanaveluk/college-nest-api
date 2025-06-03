import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CommonService } from 'src/common/services/common.service';
import { JwtService } from '@nestjs/jwt';
import { DateService } from 'src/shared/services/date.service';
import { TokenService } from 'src/auth/token.service';
import { StorageService } from 'src/shared/services/storage.service';
import { EmailService } from 'src/email/email.service';
import { passwordResetTemplate } from 'src/email/templates/password-reset.template';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordArchive } from 'src/entities/user/password-archive.entity';
import { Role } from 'src/entities/user/roles.entity';
import { OTC } from 'src/entities/user/otc.entity';
import { ResendOTCDto } from './dto/resend-otc.dto';
import { verifyEmailTemplate } from 'src/email/templates/verify-email-template';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordArchive)
    private passwordArchiveRepository: Repository<PasswordArchive>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,   
    @InjectRepository(OTC)
    private otcRepository: Repository<OTC>,     
    private jwtService: JwtService,
    private dateService: DateService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private emailService: EmailService,
    private commonService: CommonService,
  ) {}

  async updateProfile(userGuid: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { guid: userGuid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and is unique
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
    const existingUser = await this.userRepository.findOne({
      where: { email: updateProfileDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
  }

    if(!this.commonService.isNullOrEmpty(updateProfileDto.password)){
      const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
      updateProfileDto.password = hashedPassword;
    }

    Object.assign(user, updateProfileDto);
    user.updated_at = new Date();
    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'Profile updated successfully',
      profileImage: user.profileImage,
      user: {
        guid: updatedUser.guid,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        mobile: updatedUser.mobile,
        profileImage: user.profileImage 
      },
    };
  }

  async updateProfileImage(userGuid: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { guid: userGuid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Note: You'll need to implement your own file storage solution
    // This is just a placeholder for the image URL
    const imageUrl = await this.storageService.uploadFile(file);
    //const imageUrl = `uploads/${userGuid}/${file.originalname}`;
    
    user.profileImage = imageUrl;
    await this.userRepository.save(user);

    return {
      message: 'Profile image updated successfully',
      imageUrl: imageUrl,
    };
  }

  async getAllUsers() {
    const users = await this.userRepository.find({
      where: { is_deleted: false,is_active: true, isEmailVerified: true  }
    });

    return users.map(user => ({
      guid: user.guid,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      is_active: user.is_active,
      profileImage: user.profileImage
    }));
  }

  async getUserInfo(userGuid: string){
    const user = await this.userRepository.findOne({
      where: { guid: userGuid },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.password = "";
    return user;
  }

  async getUserByGuid(guid: string) {
    const user = await this.userRepository.findOne({
      where: { guid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      guid: user.guid,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      major: user.major,
      is_active: user.is_active,
    };
  }

  async toggleUserStatus(guid: string) {
    const user = await this.userRepository.findOne({
      where: { guid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = !user.is_active;
    const updatedUser = await this.userRepository.save(user);

    return {
      message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: updatedUser.is_active,
    };
  }

  async updatePassword(userGuid: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { guid: userGuid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codeExpiry = new Date();
    codeExpiry.setHours(codeExpiry.getHours() + 1);

    user.verificationCode = code;
    user.verificationCodeExpiry = codeExpiry;
    await this.userRepository.save(user);

    // In a real application, send this code via email
    return { message: 'Password reset code sent to email' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      if(!email){
        throw new NotFoundException('Invalid request.');
      }

      const user = await this.userRepository.findOne({
        where: { email: email, is_active: true, isEmailVerified: true },
      });
  
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive password reset instructions' };
      }
  
      const token = await this.generateResetToken(user.guid);
      const resetLink = `${process.env.FRONTEND_URL}/user/reset?token=${token}`;
  
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: passwordResetTemplate(resetLink),
      });
  
      return { message: 'If your email is registered, you will receive password reset instructions' };
    } catch (error) {
      throw error;
    }
  }
  
  async resetPassword1(code: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { verificationCode: code }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (user.verificationCodeExpiry < new Date()) {
      throw new UnauthorizedException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }
  
      const user = await this.userRepository.findOne({
        where: { guid: payload.sub },
      });
  
      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }
  
      // Archive current password
      const passwordArchive = this.passwordArchiveRepository.create({
        password: user.password,
        user_guid: user.guid,
        user: user
      });
      await this.passwordArchiveRepository.save(passwordArchive);
  
      // Update password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      user.password = hashedPassword;
      user.updated_at = new Date();
      await this.userRepository.save(user);
  
      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }

  private generateOTC(): string {
    //return Math.floor(100000 + Math.random() * 900000).toString();
    return Math.random().toString(36).substring(2, 8).toUpperCase();

  }

  async sendOneTimeCode(userGuid: string) {
    const user = await this.userRepository.findOne({
      where: { guid: userGuid }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 5);

    user.verificationCode = code;
    user.verificationCodeExpiry = codeExpiry;
    await this.userRepository.save(user);

    // In a real application, send this code via email or SMS
    return { message: 'One-time code sent successfully' };
  }

  async validateOneTimeCode(userGuid: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { 
        guid: userGuid,
        verificationCode: code 
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid code');
    }

    if (user.verificationCodeExpiry < new Date()) {
      throw new UnauthorizedException('Code has expired');
    }

    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Code validated successfully' };
  }

  async resendVerificationCode(resendOTCDto: ResendOTCDto): Promise<{ message: string }>{
    try {
      const user = await this.userRepository.findOne({
        where: { email: resendOTCDto.email },
      });

      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive verification code' };
      }
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = verificationCodeExpiry;
      await this.userRepository.save(user);
      
      // Send verification email
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });

      return { message: 'The verification code has been sent again. Please check your email for verification code' };

    } catch (error) {
      throw error;
    }
  }

  async updateUser(guid: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { guid, is_deleted: false },
        relations: ['role']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${guid} not found`);
      }

      const role = await this.rolesRepository.findOne({
        where: {guid: updateUserDto.roleGuid}
      });

      // Validate email uniqueness if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email, is_deleted: false }
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      Object.assign(user, updateUserDto);
      user.role = role;
      user.role_id = role?.guid || '';
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }



  async findAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.rolesRepository.find({
        order: { name: 'ASC' }
      });
      return roles;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  
  private async generateResetToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'password_reset' };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

}