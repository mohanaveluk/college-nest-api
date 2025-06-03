import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/user/refresh-token.entity';
import { User } from 'src/entities/user/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async generateTokens(user: User) {
    
    const payload = { 
        sub: user.guid, 
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      };

    const accessToken = this.jwtService.sign(payload);
    /*const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m', // Access token expires in 15 minutes
    });*/

    const refreshToken = await this.createRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      user: {
        id: user.guid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.profileImage
      } 
    };
  }

  private async createRefreshToken(user: User): Promise<RefreshToken> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token expires in 7 days

    const refreshToken = this.refreshTokenRepository.create({
      token,
      expiresAt,
      user,
      user_guid: user.guid,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async refreshAccessToken(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!token) {
      throw new Error('Invalid refresh token');
    }

    if (new Date() > token.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    const payload = { 
        sub: token.user.guid, 
        email: token.user.email,
        firstName: token.user.first_name,
        lastName: token.user.last_name,
      };

    const newAccessToken = this.jwtService.sign(payload);
    /*const newAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });*/

    return {
      access_token: newAccessToken,
    };
  }

  async revokeRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async revokeAllUserRefreshTokens(user_guid: string) {
    await this.refreshTokenRepository.update(
      { user_guid, isRevoked: false },
      { isRevoked: true }
    );
  }
}