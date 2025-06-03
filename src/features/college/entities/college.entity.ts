import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CollegeCategory } from '../dto/create-college.dto';
import { CollegeCourse } from '../../course/entities/college_course.entity';
import { Performance } from './performance.entity';
import { CategorySection } from './category-section.entity';
import { State } from './state.entity';
import { District } from './district.entity';
import { Country } from './country.entity';

@Entity('colleges')
export class College {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'int'})
  code: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  city: string;

  @ManyToOne(() => State, state => state.colleges)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({ type: 'int'})
  zip: number;

  @ManyToOne(() => District, district => district.colleges)
  @JoinColumn({ name: 'district_id' })
  district: District;


  @ManyToOne(() => Country, country => country.colleges)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({
    type: 'enum',
    enum: CollegeCategory,
    default: CollegeCategory.OTHER
  })
  category: CollegeCategory;

  @ManyToOne(() => CategorySection, categorySection => categorySection.colleges)
  @JoinColumn({ name: 'category_section_id' })
  categorySection: CategorySection;

  @Column('decimal', { precision: 3, scale: 2 })
  rating: number;

  @Column({type: 'int'})
  established: number;

  @Column({ type: 'varchar', length: 2255 })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true  })
  website: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  latitude: string;

  @Column({ type: 'varchar', length: 25, nullable: true  })
  longitude: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'varchar', length: 36, default: "SYSTEM" })
  created_by: string;

  @UpdateDateColumn({nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true  })
  updated_by: string;

  @UpdateDateColumn({nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 36, nullable: true  })
  deleted_by: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted: boolean;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => CollegeCourse, collegeCourse => collegeCourse.college, { cascade: true })
  collegeCourses: CollegeCourse[];

  @OneToMany(() => Performance, performance => performance.college)
  performances: Performance[];
}