import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { UserLoginHistory } from 'src/entities/user/user-login-history.entity';
import { Role } from 'src/entities/user/roles.entity';
import { PassportModule } from '@nestjs/passport';
import { RefreshToken } from 'src/entities/user/refresh-token.entity';
import { PasswordArchive } from 'src/entities/user/password-archive.entity';
import { OTC } from 'src/entities/user/otc.entity';
import { TokenService } from './token.service';
import { DateService } from 'src/shared/services/date.service';
import { TokenController } from './token.controller';
import { StorageService } from 'src/shared/services/storage.service';
import { EmailService } from 'src/email/email.service';
import { CommonService } from 'src/common/services/common.service';
import { UserLoginHistoryService } from './user-login-history.service';
import { JwtStrategy } from 'src/common/middleware/jwt.strategy';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthorizationGuard } from 'src/common/guards/jwt-authorization.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, PasswordArchive, Role, OTC, UserLoginHistory]),
    PassportModule.register({ defaultStrategy: 'jwt' ,
      session: false}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    TokenController
  ],
  providers: [
    AuthService, 
    JwtStrategy,
    JwtAuthGuard,
    AuthorizationGuard,
    DateService,
    TokenService,
    StorageService,
    EmailService,
    CommonService,
    UserLoginHistoryService
  ],
})
export class AuthModule {}