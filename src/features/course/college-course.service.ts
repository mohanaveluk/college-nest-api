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
export class CollegeCourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CollegeCourse)
    private collegeCourseRepository: Repository<CollegeCourse>,
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
  ) {}

  async create(collegeCourseDto: CollegeCourseUpsertDto): Promise<CollegeCourse> {
    const { college_id, course_id, ...courseData } = collegeCourseDto;

    // Find the college by ID
    const college = await this.collegeRepository.findOne({ where: { id: college_id } });
    if (!college) {
      throw new NotFoundException(`College with ID ${college_id} not found`);
    }

    // Find the course
    const course = await this.courseRepository.findOne({ where: { id: course_id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${course_id} not found`);
    }

    // Check if the college-course combination already exists
    const existingCollegeCourse = await this.collegeCourseRepository.findOne({
      where: {
        college: { id: college_id },
        course: { id: course_id }
      }
    });
    

    if (existingCollegeCourse) {
      // Update existing record
      Object.assign(existingCollegeCourse, courseData);
      return await this.collegeCourseRepository.save(existingCollegeCourse);
    } else {
      // Create new record
      const newCollegeCourse = this.collegeCourseRepository.create({
        ...courseData,
        college,
        course
      });
      return await this.collegeCourseRepository.save(newCollegeCourse);
    }

  }

  async findAll(options: {
    page: number;
    limit: number;
    collegeId?: string;
  }): Promise<{ data: CollegeCourse[]; total: number }> {
    const query = this.collegeCourseRepository.createQueryBuilder('collegeCourse')
    .leftJoinAndSelect('collegeCourse.course', 'course')

    if (options.collegeId) {
      query.where('collegeCourse.college_id = :collegeId', { collegeId: options.collegeId });
    }

    const [data, total] = await query
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<CollegeCourse> {
    const course = await this.collegeCourseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: CreateCourseDto): Promise<CollegeCourse> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return await this.collegeCourseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.collegeCourseRepository.remove(course);
  }

  async getStatistics() {
    const totalCourses = await this.collegeCourseRepository.count();
    const collegeStats = await this.collegeCourseRepository
      .createQueryBuilder('course')
      .select('course.college_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('course.college_id')
      .getRawMany();

    return {
      totalCourses,
      collegeStats,
    };
  }


}