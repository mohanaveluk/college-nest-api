import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { use } from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/entities/user/roles.entity';
import { User } from 'src/entities/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: false
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { guid: payload.sub }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { guid: user.role_id }
    });

    return {
      email: user.email,
      uguid: user.guid,
      firstName: user.first_name,
      lastName: user.last_name,
      role: role !== null && role !== undefined ? role.name : ''
    };
  }
}

