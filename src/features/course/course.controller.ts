import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CollegeCourseDto } from './dto/college-course.dto';
import { CollegeCourseUpsertDto } from './dto/college-course-upsert.dto';
import { CourseService } from './course.service';

@ApiTags('courses')
@Controller('courses')

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create new course' })
  // @ApiResponse({ status: 201, description: 'Course created successfully' })
  // @ApiResponse({ status: 400, description: 'Invalid input data' })
  // async create(@Body() collegeCourseDto: CollegeCourseUpsertDto) {
  //   return this.courseService.create(collegeCourseDto);
  // }

  
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Retrieved all courses' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  
  async findAll(
  ) {
    return this.courseService.findAll();
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: CreateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }


}