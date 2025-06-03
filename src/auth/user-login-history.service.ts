import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoginHistory } from 'src/entities/user/user-login-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserLoginHistoryService {
  constructor(
    @InjectRepository(UserLoginHistory)
    private loginHistoryRepository: Repository<UserLoginHistory>
  ) {}

  async recordLogin(user_guid: string, loginTime: Date, ipAddress: string, userAgent: string): Promise<UserLoginHistory> {
    const loginRecord = this.loginHistoryRepository.create({
      user_guid,
      login_time: loginTime,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_type: this.getDeviceType(userAgent),
    });

    return await this.loginHistoryRepository.save(loginRecord);
  }

  async recordLogout(user_guid: string): Promise<void> {
    // Find the most recent login record without a logout time
    const lastLoginRecord = await this.loginHistoryRepository.findOne({
      where: {
        user_guid,
        logout_time: null
      },
      order: {
        login_time: 'DESC'
      }
    });

    if (lastLoginRecord) {
      lastLoginRecord.logout_time = new Date();
      await this.loginHistoryRepository.save(lastLoginRecord);
    }
  }

  async getUserLoginHistory(user_guid: string): Promise<UserLoginHistory[]> {
    return await this.loginHistoryRepository.find({
      where: { user_guid },
      order: { login_time: 'DESC' }
    });
  }

  getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const ua = userAgent.toLowerCase();

    // Check for tablets first as they may also match mobile patterns
    if (
      /ipad|tablet|playbook|silk/.test(ua) ||
      (/android/.test(ua) && !/mobile/.test(ua))
    ) {
      return 'tablet';
    }

    // Check for mobile devices
    if (
      /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|webos|windows phone|iemobile/.test(ua)
    ) {
      return 'mobile';
    }

    // Default to desktop
    return 'desktop';
  }
}