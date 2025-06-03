import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { College } from '../../college/entities/college.entity';
import { Course } from './course.entity';

@Entity('college_courses')
export class CollegeCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'college_id', type: 'varchar', length: 36, nullable: false })
  college_id: string;

  @Column({ name: 'course_id', type: 'varchar', length: 36, nullable: false })
  courseId: string;

  @Column('decimal', { precision: 5, scale: 2 })
  research: number;

  @Column('decimal', { precision: 5, scale: 2 })
  infrastructure: number;

  @Column('decimal', { precision: 5, scale: 2 })
  teaching: number;

  
  @ManyToOne(() => Course, course => course.collegeCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;


  @ManyToOne(() => College, college => college.collegeCourses)
  @JoinColumn({ name: 'college_id' })
  college: College;
}