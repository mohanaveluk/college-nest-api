import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { College } from './college.entity';

@Entity('performances')
export class Performance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({ type: 'varchar', length: 36 })
  // college_id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  placements: number;

  @Column('decimal', { precision: 5, scale: 2 })
  research: number;

  @Column('decimal', { precision: 5, scale: 2 })
  infrastructure: number;

  @Column('decimal', { precision: 5, scale: 2 })
  teaching: number;

  @ManyToOne(() => College, college => college.performances)
  @JoinColumn({ name: 'college_id' })
  college: College;
}