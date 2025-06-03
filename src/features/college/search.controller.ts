import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
//@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get('colleges')
  @ApiOperation({ summary: 'Search colleges' })
  @ApiResponse({ status: 200, description: 'Retrieved matching colleges' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search keyword string' })
  @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  @ApiQuery({ name: 'district', required: false, description: 'Filter by district' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'rating', required: false, type: 'number', description: 'Filter by minimum rating' })
  @ApiQuery({ name: 'courses', required: false, description: 'Filter by courses (comma-separated)' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', schema: { type: 'number', default: 1, minimum: 1 } })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page', schema: { type: 'number', default: 10, minimum: 1 } })
  async searchColleges(


    @Query('keyword') keyword?: string,
    @Query('state') state?: string,
    @Query('district') district?: string,
    @Query('category') category?: string,
    @Query('rating') rating?: number,
    @Query('courses') courses?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.searchService.searchColleges({
      keyword,
      state,
      district,
      category,
      rating,
      courses: courses?.split(','),
      page,
      limit,
    });
  }

  @Public()
  @Get('collegex')
  @ApiOperation({ summary: 'Search colleges' })
  @ApiResponse({ status: 200, description: 'Retrieved matching colleges' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search keyword string' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  @ApiQuery({ name: 'categorySection', required: false, description: 'Filter by category section' })
  // @ApiQuery({ name: 'state', required: false, description: 'Filter by state' })
  // @ApiQuery({ name: 'district', required: false, description: 'Filter by district' })
  // @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  // @ApiQuery({ name: 'rating', required: false, type: 'number', description: 'Filter by minimum rating' })
  // @ApiQuery({ name: 'courses', required: false, description: 'Filter by courses (comma-separated)' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', schema: { type: 'number', default: 1, minimum: 1 } })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page', schema: { type: 'number', default: 10, minimum: 1 } })
  async searchCollegesByMultipleWords(

    
    @Query('k') keyword?: string,
    @Query('cs') categorySection?: string,
    @Query('location') location?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.searchService.searchCollegesByMultipleWords({
      keyword,
      categorySection,
      location,
      page,
      limit,
    });
  }

  @Public()
  @Get('colleges/nearby')
  @ApiOperation({ summary: 'Find nearby colleges' })
  @ApiResponse({ status: 200, description: 'Retrieved nearby colleges' })
  @ApiQuery({ name: 'latitude', required: true, type: 'number', description: 'Current latitude' })
  @ApiQuery({ name: 'longitude', required: true, type: 'number', description: 'Current longitude' })
  @ApiQuery({ name: 'radius', required: false, type: 'number', description: 'Search radius in kilometers', schema: { type: 'number', default: 10, minimum: 1 } })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', schema: { type: 'number', default: 1, minimum: 1 } })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page', schema: { type: 'number', default: 10, minimum: 1 } })
  async findNearbyColleges(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.searchService.findNearbyColleges({
      latitude,
      longitude,
      radius,
      page,
      limit,
    });
  }

  @Public()
  @Get('districts')
  @ApiOperation({ summary: 'Get districts by state' })
  @ApiResponse({ status: 200, description: 'Retrieved districts' })
  async getDistricts(@Query('state') state: string) {
    return this.searchService.getDistricts(state);
  }
}