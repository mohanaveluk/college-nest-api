import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecentCollege } from './entities/recent-college.entity';
import { College } from './entities/college.entity';
import { CreateRecentCollegeDto } from './dto/recent-college.dto';

@Injectable()
export class RecentCollegeService {
  constructor(
    @InjectRepository(RecentCollege)
    private recentCollegeRepository: Repository<RecentCollege>,
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
  ) {}

  async saveRecentCollege(userId: string, createRecentCollegeDto: CreateRecentCollegeDto) {
    // Check if college exists
    const college = await this.collegeRepository.findOne({
      where: { id: createRecentCollegeDto.college_id }
    });

    if (!college) {
      throw new NotFoundException('College not found');
    }

    // Check if already exists in recent visits
    let recentCollege = await this.recentCollegeRepository.findOne({
      where: {
        user_id: userId,
        college_id: createRecentCollegeDto.college_id,
      }
    });

    if (recentCollege) {
      // Update existing record
      recentCollege.last_visited = new Date();
      recentCollege.visit_count += 1;
      recentCollege.active = true;
      if (createRecentCollegeDto.notes) {
        recentCollege.notes = createRecentCollegeDto.notes;
      }
      if (createRecentCollegeDto.tags) {
        const existingTagsArray = recentCollege.tags.split(', ').map(tag => tag.trim());
        const tagsArray = [...new Set([...existingTagsArray, ...createRecentCollegeDto.tags])];
        recentCollege.tags = tagsArray.join(', ');
      }
    } else {
      // Create new record
      recentCollege = this.recentCollegeRepository.create({
        user_id: userId,
        college_id: createRecentCollegeDto.college_id,
        notes: createRecentCollegeDto.notes,
        last_visited: new Date(),
      });
      if (createRecentCollegeDto.tags) {
        recentCollege.tags = [...createRecentCollegeDto.tags].join(', ');
      }
    }

    return await this.recentCollegeRepository.save(recentCollege);
  }

  async getRecentColleges(userId: string, options: { limit: number; page: number }) {
    const [recentColleges, total] = await this.recentCollegeRepository.findAndCount({
      where: { user_id: userId, active: true },
      relations: ['college', 'college.state', 'college.district', 'college.country', 'college.collegeCourses', 'college.collegeCourses.course', 'college.performances'],
      order: { last_visited: 'DESC' },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    });

    return {
      data: recentColleges,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async getSuggestions(userId: string, limit: number) {
    // Get user's recent colleges
    const recentColleges = await this.recentCollegeRepository.find({
      where: { user_id: userId, active: true },
      relations: ['college'],
      order: { visit_count: 'DESC' },
      take: 5,
    });

    if (recentColleges.length === 0) {
      return [];
    }

    // Extract categories and states from recent visits
    const categories = [...new Set(recentColleges.map(rc => rc.college.category))];
    const states = [...new Set(recentColleges.map(rc => rc.college.state))];

    // Find similar colleges
    const suggestions = await this.collegeRepository
      .createQueryBuilder('college')
      .where('college.category IN (:...categories)', { categories })
      .orWhere('college.state IN (:...states)', { states })
      .andWhere('college.id NOT IN (:...recentIds)', {
        recentIds: recentColleges.map(rc => rc.college_id),
      })
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();

    return suggestions;
  }
}