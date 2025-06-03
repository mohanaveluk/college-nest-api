import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateRecentCollegeDto } from './dto/recent-college.dto';
import { User } from 'src/common/decorators/user.decorator';
import { RecentCollegeService } from './recent-college.service';


@ApiTags('recent-colleges')
@Controller('recent-colleges')
export class RecentCollegeController {
  constructor(private readonly recentCollegeService: RecentCollegeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Save recently visited college' })
  @ApiResponse({ status: 201, description: 'College saved to recent visits' })
  async saveRecentCollege(
    @User('uguid') userId: string,
    @Body() createRecentCollegeDto: CreateRecentCollegeDto,
  ) {
    return this.recentCollegeService.saveRecentCollege(userId, createRecentCollegeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user\'s recently visited colleges' })
  @ApiResponse({ status: 200, description: 'Retrieved recent colleges' })
  async getRecentColleges(
    @User('uguid') userId: string,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ) {
    return this.recentCollegeService.getRecentColleges(userId, { limit, page });
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get college suggestions based on recent visits' })
  @ApiResponse({ status: 200, description: 'Retrieved college suggestions' })
  async getSuggestions(
    @User('uguid') userId: string,
    @Query('limit') limit: number = 5,
  ) {
    return this.recentCollegeService.getSuggestions(userId, limit);
  }
}