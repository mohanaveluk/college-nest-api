import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserLoginHistory } from './user-login-history.entity';
import { Role } from './roles.entity';
import { RefreshToken } from './refresh-token.entity';
import { PasswordArchive } from './password-archive.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  guid: string;

  @Column({ type: 'text' })
  first_name: string;

  @Column({ type: 'text' })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  country_code: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  mobile: string;

  @Column({ type: 'text', nullable: true })
  major: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  verificationCode: string;

  @Column({ type: 'datetime', nullable: true })
  verificationCodeExpiry: Date;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login: Date;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @OneToMany(() => UserLoginHistory, loginHistory => loginHistory.user)
  loginHistory: UserLoginHistory[];

  @OneToMany(() => PasswordArchive, passwordArchive => passwordArchive.user)
  password_history: PasswordArchive[];
  
  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];
}