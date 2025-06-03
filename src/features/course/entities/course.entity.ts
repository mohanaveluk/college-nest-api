import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, Timestamp, UpdateDateColumn } from 'typeorm';
import { CollegeCourse } from './college_course.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @CreateDateColumn()
  created_at: Date; // Let TypeORM handle the defaults
  
  @UpdateDateColumn({nullable: true})
  updated_at: Date;

  @OneToMany(() => CollegeCourse, collegeCourse => collegeCourse.course)
  collegeCourses: CollegeCourse[];
}