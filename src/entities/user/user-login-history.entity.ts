import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_login_history')
export class UserLoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_guid: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  login_time: Date;

  @Column({ type: 'datetime', nullable: true })
  logout_time: Date;

  @Column({ type: 'text', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  device_type: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @ManyToOne(() => User, user => user.loginHistory)
  user: User;
}