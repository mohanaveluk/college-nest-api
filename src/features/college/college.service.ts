import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { College } from './entities/college.entity';
import { Performance } from './entities/performance.entity';
import { CollegeCourse } from '../course/entities/college_course.entity';
import { CollegeCategory, CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Country } from './entities/country.entity';
import { CollegeCourseDto } from '../course/dto/college-course.dto';
import { CategorySection } from './entities/category-section.entity';
import { GetCollegesByCategoryDto } from './dto/get-colleges-by-category.dto';
import { CollegesByCategoryResponse } from './dto/colleges-by-category.response';
import { stat } from 'fs';

@Injectable()
export class CollegeService {
  constructor(
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,
    @InjectRepository(CollegeCourse)
    private courseRepository: Repository<CollegeCourse>,
    @InjectRepository(CategorySection)
    private categorySectionRepository: Repository<CategorySection>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async create1(createCollegeDto: CreateCollegeDto) {
    const college = this.collegeRepository.create({
      ...createCollegeDto,
      state: { id: createCollegeDto.state_id }, // Map state to the expected type
      district: { id: createCollegeDto.district_id }, // Map district to the expected type
    });
    return await this.collegeRepository.save(college);
  }

  async create(createCollegeDto: CreateCollegeDto): Promise<College> {
    const { state_id, district_id, country_id, courses = [], ...collegeData } = createCollegeDto;

    const state = await this.stateRepository.findOne({ where: { id: state_id } });
    if (!state) {
      throw new NotFoundException('State not found');
    }

    const district = await this.districtRepository.findOne({ where: { id: district_id } });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const country = await this.countryRepository.findOne({ where: { id: country_id } });
    if (!country) {
      throw new NotFoundException('Country not found');
    }

    // Check if college with same name and location exists
    const existingCollege = await this.collegeRepository.findOne({
      where: {
        name: collegeData.name,
        city: collegeData.city,
        state: { id: state_id },
        district: { id: district_id },
        country: { id: country_id }
      },
      relations: ['state', 'district', 'country']
    });

    // If college exists, update it
    if (existingCollege) {
      Object.assign(existingCollege, collegeData);

      // Handle courses update
      if (courses.length > 0) {
        // Remove existing courses
        await this.courseRepository.delete({ college: { id: existingCollege.id } });

        // Create new courses
        const collegeCourses = courses.map(course =>
          this.courseRepository.create({
            ...course,
            college: { id: existingCollege.id },
            course: { id: course.course_id }
          })
        );
        await this.courseRepository.save(collegeCourses);
      }

      return await this.collegeRepository.save(existingCollege);
    }

    const college = this.collegeRepository.create({
      ...collegeData,
      state,
      district,
      country,
      collegeCourses: createCollegeDto.courses?.map(course => ({
        ...course,
        course: { id: course.course_id }
      }))
    });

    // Save college to get the ID
    const savedCollege = await this.collegeRepository.save(college);

    return savedCollege;
  }



  async upsertCollege(upsertCollegeDto: CreateCollegeDto): Promise<College> {
    const { state_id, district_id, country_id, category_section_id, courses = [], ...collegeData } = upsertCollegeDto;

    // Validate required relationships
    const state = await this.stateRepository.findOne({ where: { id: state_id } });
    if (!state) throw new NotFoundException('State not found');

    const district = await this.districtRepository.findOne({ where: { id: district_id } });
    if (!district) throw new NotFoundException('District not found');

    const country = await this.countryRepository.findOne({ where: { id: country_id } });
    if (!country) throw new NotFoundException('Country not found');

    const categorySection = await this.categorySectionRepository.findOne({ where: { id: category_section_id } });
    if (!categorySection) throw new NotFoundException('Categoty section not found');

    // Check if college exists based on unique criteria
    const existingCollege = await this.collegeRepository.findOne({
      where: {
        name: collegeData.name,
        city: collegeData.city,
        state: { id: state_id },
        district: { id: district_id },
        country: { id: country_id }
      },
      relations: ['collegeCourses']
    });

    // Prepare college data with relationships
    const collegeWithRelations = {
      ...collegeData,
      state,
      district,
      country,
      categorySection
    };

    let college: College;

    if (existingCollege) {
      // Update existing college
      Object.assign(existingCollege, collegeWithRelations);
      college = await this.collegeRepository.save(existingCollege);
      
      // Handle courses update
      //await this.handleCoursesUpdate(college.id, courses);
      // If courses are provided, update them
      // Handle courses
      if (courses?.length > 0) {
        await this.handleCollegeCourses(
          existingCollege?.id || college.id, 
          courses
        );
      }
    } else {
      // Create new college with cascade for courses
      college = this.collegeRepository.create({
        ...collegeWithRelations,
        collegeCourses: courses.map(course => ({
          ...course,
          course: { id: course.course_id }
        }))
      });
      college = await this.collegeRepository.save(college);
    }

    // Return the college with all relations
    return this.collegeRepository.findOne({
      where: { id: college.id },
      relations: ['state', 'district', 'country', 'collegeCourses', 'collegeCourses.course', 'categorySection']
    });
  }

  private async handleCoursesUpdate(collegeId: string, courses: CollegeCourseDto[]) {
    // Remove existing courses
    await this.courseRepository.delete({ college: { id: collegeId } });
    
    // Create new courses if provided
    if (courses.length > 0) {
      const collegeCourses = courses.map(course => 
        this.courseRepository.create({
          ...course,
          college: { id: collegeId },
          course: { id: course.course_id }
        })
      );
      await this.courseRepository.save(collegeCourses);
    }
  }

  private async handleCollegeCourses(collegeId: string, courses: CollegeCourseDto[]) {
    // Remove existing courses if updating
    if (await this.courseRepository.count({ where: { college: { id: collegeId } }})) {
      await this.courseRepository.delete({ college: { id: collegeId } });
    }
  
    // Create new course relationships
    const collegeCourses = courses.map(course => 
      this.courseRepository.create({
        college: { id: collegeId },
        course: { id: course.course_id },
        research: course.research,
        infrastructure: course.infrastructure,
        teaching: course.teaching
      })
    );
  
    await this.courseRepository.save(collegeCourses);
  }


  async findAll(page: number, limit: number) {
    const [colleges, total] = await this.collegeRepository.findAndCount({
      where: { active: true },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['performances', 'collegeCourses', 'district', 'state', 'country'],
    });

    return {
      data: colleges,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const college = await this.collegeRepository.findOne({
      where: { id },
      relations: ['performances', 'collegeCourses', 'district', 'state', 'country', 'collegeCourses.course', 'categorySection'],
    });

    if (!college) {
      throw new NotFoundException(`College with ID ${id} not found`);
    }

    return college;
  }

  async findBySection(category_section_id: string): Promise<College[]> {
    const categorySection = await this.categorySectionRepository.findOne({ where: { id: category_section_id } });
    if (!categorySection) {
      throw new NotFoundException(`Category section with ID ${category_section_id} not found`);
    }
    // Find colleges by category section
    const college = await this.collegeRepository.find({
      where: { categorySection}, 
      relations: ['performances', 'collegeCourses', 'district', 'state', 'country', 'collegeCourses.course', 'categorySection'],
    });

    if (!college) {
      throw new NotFoundException(`College with category section id ${category_section_id} not found`);
    }

    return college;
  }


  async getCollegesByCategorySections(
    dto: GetCollegesByCategoryDto, limitPerCategory: number = 25
  ): Promise<CollegesByCategoryResponse> {
    // Get all category sections (filtered if IDs are provided)
    /*
    const categorySections1 = await this.categorySectionRepository.find({
      where: dto.category_section_ids ? {
        id: In(dto.category_section_ids)
      } : undefined,
      relations: ['colleges',
                  'colleges.state',
                  'colleges.district',
                  'colleges.country',
                  'colleges.collegeCourses',
                  'colleges.collegeCourses.course',
                  'colleges.performances'
                ],
       take: limitPerCategory,
    });*/

    const categorySections = await this.categorySectionRepository.find({
      where: dto.category_section_ids ? {
        id: In(dto.category_section_ids)
      } : undefined,
      take: limitPerCategory,
    });

    // Then for each category section, fetch limited colleges
    for (const section of categorySections) {
      section.colleges = await this.collegeRepository.find({
        where: { categorySection: { id: section.id } },
        relations: [
          'state',
          'district',
          'country',
          'collegeCourses',
          'collegeCourses.course',
          'performances'
        ],
        take: limitPerCategory,
      });
    }


    /*const results1 = await Promise.all(
      categorySections.map(async section => {
        // Get colleges with limit
        const colleges = await this.collegeRepository.find({
          where: { categorySection: { id: section.id } },
          relations: ['state', 'district', 'country'],
          take: limitPerCategory, // This is where we limit the results
          order: { rating: 'DESC' } // Optional: order by rating
        });
        
        return {
          categorySection: section,
          colleges
        };
      })
    );*/

  
    // Transform the results
    // Map through each category section and its colleges
    const results = categorySections.map(section => {
      const { colleges, ...categorySection } = section;

      return {
        categorySection,
        colleges: colleges.map(college => ({
          ...college,
          collegeCourses: college.collegeCourses.map(course => ({
            ...course,
            
          })),
          state: college.state ? {
            id: college.state.id,
            name: college.state.name,
            code: college.state.code,
            countryId: college.state.countryId,

          } : null,
          
        }))
      };
    });
  
    return { results };
  }

  
  async update1(id: string, updateCollegeDto: UpdateCollegeDto) {
    const college = await this.findOne(id);
    Object.assign(college, updateCollegeDto);
    return await this.collegeRepository.save(college);
  }

  async update(college_id: string, updateCollegeDto: UpdateCollegeDto): Promise<College> {
    const { state_id, district_id, country_id, courses = [], ...collegeData } = updateCollegeDto;

    // 1. Find the existing college with its relationships
    const college = await this.collegeRepository.findOne({
      where: { id: college_id },
      relations: ['collegeCourses']
    });

    if (!college) {
      throw new Error('College not found');
    }

    // 2. Validate and load relationships
    const state = await this.stateRepository.findOne({ where: { id: state_id } });
    if (!state) {
      throw new Error('State not found');
    }

    const district = await this.districtRepository.findOne({ where: { id: district_id } });
    if (!district) {
      throw new Error('District not found');
    }

    const country = await this.countryRepository.findOne({ where: { id: country_id } });
    if (!country) {
      throw new Error('Country not found');
    }

    // 3. Update college properties
    Object.assign(college, {
      ...collegeData,
      state,
      district,
      country
    });

    // 4. Handle courses update
    if (courses) {
      // Remove existing college courses
      await this.courseRepository.delete({ college: { id: college_id } });

      // Create new college courses if provided
      if (courses.length > 0) {
        college.collegeCourses = courses.map(course => (
          this.courseRepository.create({
            ...course,
            college: { id: college_id },
            course: { id: course.course_id }
          })
        ));
      }
    }

    // 5. Save and return updated college
    return await this.collegeRepository.save(college);
  }

  async remove(id: string) {
    const college = await this.findOne(id);
    college.active = false;
    return await this.collegeRepository.save(college);
  }

  async addPerformance(id: string, createPerformanceDto: CreatePerformanceDto) {
    await this.findOne(id);
    const performance = this.performanceRepository.create({
      ...createPerformanceDto,
      college:{id: id},
    });
    return await this.performanceRepository.save(performance);
  }

  async upsertPerformance(collegeId: string, createPerformanceDto: CreatePerformanceDto): Promise<Performance> {
    return this.performanceRepository.manager.transaction(async transactionalEntityManager => {
        // Verify college exists
        const college = await transactionalEntityManager.findOne(College, {
            where: { id: collegeId },
            relations: ['performances']
        });

        if (!college) {
            throw new NotFoundException(`College with ID ${collegeId} not found`);
        }

        let performance = college.performances?.[0];

        if (performance) {
            // Update existing
            Object.assign(performance, createPerformanceDto);
        } else {
            // Create new
            performance = transactionalEntityManager.create(Performance, {
                ...createPerformanceDto,
                college: { id: collegeId }
            });
        }

        return await transactionalEntityManager.save(performance);
    });
  }

  async getPerformance(id: string) {
    const performance = await this.performanceRepository.find({
      where: { college: {id: id} },
    });

    if (!performance) {
      throw new NotFoundException(`Performance for college ID ${id} not found`);
    }

    return performance;
  }

  async getCourses(id: string) {
    const courses = await this.courseRepository.find({
      where: { college_id: id },
    });

    if (!courses) {
      throw new NotFoundException(`Courses for college ID ${id} not found`);
    }

    return courses;
  }

  async findByDistrict(district: string) {
    const districtEntity = await this.districtRepository.findOne({ where: { name: district } });
    if (!districtEntity) {
      throw new NotFoundException(`District with name ${district} not found`);
    }

    return await this.collegeRepository.find({
      where: { district: districtEntity, active: true },
    });
  }

  async findByCategory(category: CollegeCategory) {
    return await this.collegeRepository.find({
      where: { category, active: true },
    });
  }

  async findTopRated(limit: number) {
    return await this.collegeRepository.find({
      where: { active: true },
      order: { rating: 'DESC' },
      take: limit,
    });
  }


  async getDistricts(): Promise<District[]> {
    const district = await this.districtRepository.find();
    if (!district) {
      throw new NotFoundException('State not found');
    }
    return district;
  }

  async getStates(): Promise<State[]> {
    const state = await this.stateRepository.find();
    if (!state) {
      throw new NotFoundException('State not found');
    }
    return state;
  }

  
  async getCountries(): Promise<Country[]> {
    const country = await this.countryRepository.find();
    if (!country) {
      throw new NotFoundException('State not found');
    }
    return country;
  }

}