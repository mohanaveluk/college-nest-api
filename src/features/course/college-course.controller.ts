import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CollegeCourseService } from './college-course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CollegeCourseDto } from './dto/college-course.dto';
import { CollegeCourseUpsertDto } from './dto/college-course-upsert.dto';

@ApiTags('college-courses')
@Controller('college-courses')

export class CollegeCourseController {
  constructor(private readonly courseService: CollegeCourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() collegeCourseDto: CollegeCourseUpsertDto) {
    return this.courseService.create(collegeCourseDto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Retrieved all courses' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', schema: { type: 'number', default: 1, minimum: 1 } })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page', schema: { type: 'number', default: 10, minimum: 1 } })
  @ApiQuery({ name: 'college', required: false, description: 'Filter by college' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('college') collegeId?: string,
  ) {
    return this.courseService.findAll({ page, limit, collegeId });
  }

  @Get(':id')
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

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get courses statistics' })
  @ApiResponse({ status: 200, description: 'Retrieved courses statistics' })
  async getStats() {
    return this.courseService.getStatistics();
  }

  

}