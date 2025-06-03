import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollegeService } from './college.service';
import { CollegeCategory, CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { CollegesByCategoryResponse } from './dto/colleges-by-category.response';
import { GetCollegesByCategoryDto } from './dto/get-colleges-by-category.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@ApiTags('colleges')
@Controller('colleges')
//@UseGuards(JwtAuthGuard)
@Public()
export class CollegeController {
  constructor(private readonly collegeService: CollegeService) {}

  @Post()
  @ApiOperation({ summary: 'Create new college' })
  create(@Body() createCollegeDto: CreateCollegeDto) {
    console.log('request:', createCollegeDto);

    //return this.collegeService.create(createCollegeDto);
    return this.collegeService.upsertCollege(createCollegeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all colleges' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.collegeService.findAll(page, limit);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated colleges' })
  getTopRated(@Query('limit') limit = 10) {
    return this.collegeService.findTopRated(limit);
  }

  
  @Get('states')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all states' })
  @ApiResponse({ status: 200, description: 'Retrieved all States' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })

  async states(
  ) {
    return this.collegeService.getStates();
  }
  
  
  @Get('districts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all districts' })
  @ApiResponse({ status: 200, description: 'Retrieved all States' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })

  async districts(
  ) {
    return this.collegeService.getDistricts();
  }

  
  
  @Get('countries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'Retrieved all States' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })

  async countries(
  ) {
    return this.collegeService.getCountries();
  }

  


  @Get('category_section/:category_section_id')
  @ApiOperation({ summary: 'Get colleges by category section by id' })
  findBySection(@Param('category_section_id') category_section_id: string) {
    return this.collegeService.findBySection(category_section_id);
  }



  @Get('by-category')
  @ApiOperation({ summary: 'Get colleges grouped by category sections' })
  @ApiResponse({
    status: 200,
    description: 'Returns colleges grouped by category sections',
    type: CollegesByCategoryResponse
  })
  async getCollegesByCategory(
    @Query() dto: GetCollegesByCategoryDto
  ): Promise<CollegesByCategoryResponse> {
    return this.collegeService.getCollegesByCategorySections(dto);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get college by id' })
  findOne(@Param('id') id: string) {
    return this.collegeService.findOne(id);
  }


  @Put(':id')
  @ApiOperation({ summary: 'Update college' })
  update(@Param('id') id: string, @Body() updateCollegeDto: UpdateCollegeDto) {
    return this.collegeService.update(id, updateCollegeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete college' })
  remove(@Param('id') id: string) {
    return this.collegeService.remove(id);
  }

  @Post(':id/performance')
  @ApiOperation({ summary: 'Add college performance' })
  addPerformance(
    @Param('id') id: string,
    @Body() createPerformanceDto: CreatePerformanceDto,
  ) {
    //return this.collegeService.addPerformance(id, createPerformanceDto);
    return this.collegeService.upsertPerformance(id, createPerformanceDto);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get college performance' }) // by collegeId
  getPerformance(@Param('id') id: string) {
    return this.collegeService.getPerformance(id);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get college courses' }) // by collegeId
  getCourses(@Param('id') id: string) {
    return this.collegeService.getCourses(id);
  }

  @Get('district/:district')
  @ApiOperation({ summary: 'Get colleges by district' })
  getByDistrict(@Param('district') district: string) {
    return this.collegeService.findByDistrict(district);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get colleges by category' })
  getByCategory(@Param('category') category: CollegeCategory) {
    return this.collegeService.findByCategory(category);
  }


}