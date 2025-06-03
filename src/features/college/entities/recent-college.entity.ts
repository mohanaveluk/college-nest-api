import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { College } from './college.entity';
import { User } from 'src/entities/user/user.entity';

@Entity('recent_colleges')
export class RecentCollege {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  college_id: string;

  @Column()
  user_id: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  last_visited: Date;

  @Column({ default: 1 })
  visit_count: number;

  @Column('text', { nullable: true })
  tags: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => College)
  @JoinColumn({ name: 'college_id' })
  college: College;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}