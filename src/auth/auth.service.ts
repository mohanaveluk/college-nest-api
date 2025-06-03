import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/entities/user/roles.entity';
import { UserLoginHistory } from 'src/entities/user/user-login-history.entity';
import { OTC } from 'src/entities/user/otc.entity';
import { DateService } from 'src/shared/services/date.service';
import { TokenService } from './token.service';
import { StorageService } from 'src/shared/services/storage.service';
import { EmailService } from 'src/email/email.service';
import { CommonService } from 'src/common/services/common.service';
import { UserLoginHistoryService } from './user-login-history.service';
import { v4 as uuidv4 } from 'uuid';
import { verifyEmailTemplate } from 'src/email/templates/verify-email-template';
import { VerifyEmailDto } from 'src/user/dto/verify-email.dto';
import { Request } from 'express';
import { ResetPasswordDto } from 'src/user/dto/reset-password.dto';
import { passwordResetTemplate } from 'src/email/templates/password-reset.template';
import { ResendOTCDto } from 'src/user/dto/resend-otc.dto';
import { PasswordArchive } from 'src/entities/user/password-archive.entity';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserLoginHistory)
    private loginHistoryRepository: Repository<UserLoginHistory>,
    @InjectRepository(OTC)
    private otcRepository: Repository<OTC>, 
    private dateService: DateService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private emailService: EmailService,
    private userLoginHistoryService: UserLoginHistoryService,
    @InjectRepository(PasswordArchive)
    private passwordArchiveRepository: Repository<PasswordArchive>,
    private commonService: CommonService,
    
  ) {}

  async register(registerDto: RegisterDto) {
    
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email, isEmailVerified: true },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exist');
      }

      const unverifiedUser = await this.userRepository.findOne({
        where: { email: registerDto.email, isEmailVerified: false },
      });

      let role = await this.rolesRepository.findOne({ where: { guid: registerDto.role_id } });
      if (!role) {
        role = await this.rolesRepository.findOne({ where: { name: 'user' } });
        if (!role) {
          throw new Error('Default role not found');
        }
      }


      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      if(unverifiedUser){
        // Update user properties
        Object.assign(unverifiedUser, registerDto);
        unverifiedUser.password = hashedPassword;
        unverifiedUser.updated_at = new Date();
        unverifiedUser.verificationCode = verificationCode;
        unverifiedUser.verificationCodeExpiry = verificationCodeExpiry;
        unverifiedUser.isEmailVerified = false;
        unverifiedUser.is_active = false;
      }


      if (!role) {
        throw new UnauthorizedException('Default role not found');
      }

      const user = unverifiedUser ? unverifiedUser : (this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        guid: uuidv4(),
        role,
        role_id: role.guid,
        created_at: new Date(await this.dateService.getCurrentDateTime()),
        verificationCode,
        verificationCodeExpiry,
        isEmailVerified: false,
        is_active: false
      }));

      const savedUser = await this.userRepository.save(user);
      //const tokens = await this.tokenService.generateTokens(savedUser);

      // Send verification email
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });

      return {
        message: 'User registered successfully. Please check your email for verification code.' ,
        user: {
          guid: savedUser.guid,
          email: savedUser.email,
          first_name: savedUser.first_name,
          last_name: savedUser.last_name,
        },
      };

    } catch (error) {
      throw error;
    }
  }

  private generateOTC(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async login(loginDto: LoginDto, req: Request) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Oops, Invalid User Id.');
    }

    if (!user.isEmailVerified) {
      // Generate new verification code if needed
      if (!user.verificationCode || new Date() > user.verificationCodeExpiry) {
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
      }

      throw new UnauthorizedException('Please verify your email address. A verification code has been sent to your email.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Oops, Password is incorrect.');
    }

    // Record login
    const loginTime = new Date();
    await this.userLoginHistoryService.recordLogin(
      user.guid,
      loginTime,
      req.ip,
      req.headers['user-agent']
    );

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    /*const token = this.jwtService.sign({ sub: user.guid, email: user.email });

    return {
      status: true,
      access_token: token,
      user: {
        guid: user.guid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };*/

    return this.tokenService.generateTokens(user);

  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email }
    });

    if (!user) {
      throw new BadRequestException('Invalid email address');
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    if (!user.verificationCode || 
        user.verificationCode !== verifyEmailDto.code ||
        new Date() > user.verificationCodeExpiry) {
      throw new BadRequestException('Invalid or expired verification code');
    }


    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.is_active = true;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async logout(userGuid: string) {
    const lastLogin = await this.loginHistoryRepository.findOne({
      where: { 
        user_guid: userGuid,
        logout_time: null 
      }
    });

    if (lastLogin) {
      lastLogin.logout_time = new Date();
      await this.loginHistoryRepository.save(lastLogin);
    }

    return { message: 'Logged out successfully' };
  }

  async getUserInfo(userId: string){
    const user = await this.userRepository.findOne({
      where: { guid: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.password = "";
    return user;
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<{ message: string; imageUrl: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { guid: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const imageUrl = await this.storageService.uploadFile(file);
      
      user.profileImage = imageUrl;
      user.updated_at = new Date();
      await this.userRepository.save(user);

      return {
        message: 'Profile image uploaded successfully',
        imageUrl,
      };
    } catch (error) {
      throw error;
    }
  }


  async getProfileImage(userId: string) {
    const user = await this.userRepository.findOne({ where: { guid: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { profile_image: user.profileImage };
  }

  async updateProfile(userId: string, updateData: Partial<User>) {
    try {
      const user = await this.userRepository.findOne({ where: { guid: userId } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if email is being updated and is unique
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateData.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      if (!this.commonService.isNullOrEmpty(updateData.password)) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        updateData.password = hashedPassword;
      }

      Object.assign(user, updateData);
      user.updated_at = new Date();
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
  
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive password reset instructions' };
      }
  
      const token = await this.generateResetToken(user.guid);
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;
  
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

  async generateResetToken(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { guid: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: user.guid, type: 'password_reset' };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async verifyResetToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  async verifyEmailToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

}