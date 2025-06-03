import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  guid: string;

  @Column({nullable: false, length: 100})
  name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}