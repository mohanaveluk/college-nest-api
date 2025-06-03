import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollegeCourse } from './entities/college_course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { CollegeCourseDto } from './dto/college-course.dto';
import { College } from '../college/entities/college.entity';
import { Course } from './entities/course.entity';
import { CollegeCourseUpsertDto } from './dto/college-course-upsert.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) { }


  async findAll(): Promise<{ data: Course[]; total: number }> {
    const query = this.courseRepository.createQueryBuilder('course')
    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: CreateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

}