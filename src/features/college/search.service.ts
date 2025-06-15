import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { College } from './entities/college.entity';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { CategorySection } from './entities/category-section.entity';
import { CollegeSearchResponse } from './dto/college-search-response';
import { SearchQueryService } from './search-query.services';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(CategorySection)
    private categorySectionRepository: Repository<CategorySection>,
    private searchQueryService: SearchQueryService
  ) { }

  async searchColleges(options: {
    keyword?: string;
    state?: string;
    district?: string;
    country?: string;
    category?: string;
    rating?: number;
    courses?: string[];
    page: number;
    limit: number;
  }) {
    const query = this.collegeRepository
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.country', 'country')
      .leftJoinAndSelect('college.collegeCourses', 'collegeCourses')
      .leftJoinAndSelect('collegeCourses.course', 'course')
      .leftJoinAndSelect('college.performances', 'performance')


    // Keyword search across multiple fields
    if (options.keyword) {
      query.where(
        `(
          LOWER(college.name) LIKE LOWER(:keyword) OR 
          LOWER(college.description) LIKE LOWER(:keyword) OR 
          LOWER(college.city) LIKE LOWER(:keyword) OR 
          LOWER(state.name) LIKE LOWER(:keyword) OR 
          LOWER(district.name) LIKE LOWER(:keyword) OR 
          LOWER(country.name) LIKE LOWER(:keyword)
        )`,
        { keyword: `%${options.keyword}%` }
      );
    }

    // State filter by name (not ID)
    if (options.state) {
      query.andWhere('LOWER(state.name) LIKE LOWER(:state)', {
        state: `%${options.state}%`
      });
    }

    // District filter by name (not ID)
    if (options.district) {
      query.andWhere('LOWER(district.name) LIKE LOWER(:district)', {
        district: `%${options.district}%`
      });
    }

    // Country filter by name (not ID)
    if (options.country) {
      query.andWhere('LOWER(country.name) LIKE LOWER(:country)', {
        country: `%${options.country}%`
      });
    }

    // Category filter
    if (options.category) {
      query.andWhere('LOWER(college.category) = LOWER(:category)', {
        category: options.category
      });
    }

    // Rating filter
    if (options.rating) {
      query.andWhere('college.rating >= :rating', {
        rating: options.rating
      });
    }

    // Courses filter
    if (options.courses && options.courses.length > 0) {
      query.andWhere('LOWER(course.name) IN (:...courses)', {
        courses: options.courses.map(c => c.toLowerCase())
      });
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await query
      .orderBy('college.name', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchCollegesByMultipleWords(options: {
    keyword?: string;
    categorySection?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<CollegeSearchResponse> {
    let searchTermsExtracted: string[] = [];
    const query = this.collegeRepository
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.country', 'country')
      .leftJoinAndSelect('college.collegeCourses', 'collegeCourses')
      .leftJoinAndSelect('collegeCourses.course', 'course')
      .leftJoinAndSelect('college.performances', 'performance')
      .leftJoinAndSelect('college.categorySection', 'section')

    // Parse and process keywords
    if (options.keyword) {
      const { searchTerms, locationTerms } = this.parseSearchQueryv2(options.keyword);
      searchTermsExtracted = searchTerms;
      console.log(searchTerms, locationTerms);
      const keywordConditions = searchTerms.map((keyword, index) => {
        const paramName = `keyword${index}`;
        const numericValue = Number(keyword);
        const isNumber = !isNaN(numericValue) && keyword.trim() !== '';

        if (isNumber) {
          query.setParameter(paramName, numericValue);
          return `(
            college.rating = :${paramName} OR 
            college.zip = :${paramName} OR 
            college.established = :${paramName} 
          )`;
        }
        // Handle string search
        query.setParameter(paramName, `%${keyword}%`);
        return `(
          college.name LIKE :${paramName} OR
          college.description LIKE :${paramName} OR
          college.address LIKE :${paramName} OR
          college.city LIKE :${paramName} OR
          college.category LIKE :${paramName} OR
          district.name LIKE :${paramName} OR
          state.name LIKE :${paramName} OR
          country.name LIKE :${paramName} OR
          course.name LIKE :${paramName} OR
          section.title LIKE :${paramName}
        )`;
      }).join(' OR ');

      query.where(`(${keywordConditions})`);
    }

    // Category section filter
    if (options.categorySection && options.categorySection?.trim().toLowerCase() !== 'all') {
      query.andWhere('LOWER(section.title) LIKE LOWER(:title)', {
        title: `%${options.categorySection}%`
      });
    }
    // Sort by location specificity (city > district > state)
    //---query.setParameter(paramName, `%${keyword}%`);

    // Add pagination
    const page = options.page || 1;
    const limit = options.limit || 100;
    const skip = (page - 1) * limit;

    const [colleges, total] = await query
      .orderBy('college.rating', 'DESC')
      .addOrderBy('college.name', 'ASC') // Secondary sort
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    const rankColleges = this.rankColleges(colleges, searchTermsExtracted ? searchTermsExtracted : []);
    return {
      data: rankColleges,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchInstitutions2(options: {
    keyword?: string;
    categorySection?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const { primarySearchTerm, locationTerms, institutionSynonyms, filters } =
      this.parseSearchQueryv4(options.keyword);

    // let queryBuilder1 = this.collegeRepository.createQueryBuilder('inst')
    //   .leftJoinAndSelect('college', 'location')
    //   .leftJoinAndSelect('location.city', 'city')
    //   .leftJoinAndSelect('location.district', 'district')
    //   .leftJoinAndSelect('location.state', 'state');

    // Add pagination
    const page = options.page || 1;
    const limit = options.limit || 100;
    const skip = (page - 1) * limit;
    

    let queryBuilder = this.collegeRepository
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.country', 'country')
      .leftJoinAndSelect('college.collegeCourses', 'collegeCourses')
      .leftJoinAndSelect('collegeCourses.course', 'course')
      .leftJoinAndSelect('college.performances', 'performance')
      .leftJoinAndSelect('college.categorySection', 'section')

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
    });

    // Handle location-based searches
    if (locationTerms.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          locationTerms.forEach(term => {
            qb.orWhere('LOWER(city) LIKE LOWER(:term)', { term: `%${term}%` })
              .orWhere('LOWER(address) LIKE LOWER(:term)', { term: `%${term}%` })
              .orWhere('LOWER(district.name) LIKE LOWER(:term)', { term: `%${term}%` })
              .orWhere('LOWER(state.name) LIKE LOWER(:term)', { term: `%${term}%` })
              .orWhere('LOWER(country.name) LIKE LOWER(:term)', { term: `%${term}%` });
          });
        })
      );

      // Sort by location specificity (city > district > state)
      queryBuilder = queryBuilder
        .orderBy(`
          CASE
            WHEN LOWER(city) LIKE LOWER('%${locationTerms[0]}%') THEN 1
            WHEN LOWER(address) LIKE LOWER('%${locationTerms[0]}%') THEN 2
            WHEN LOWER(district.name) LIKE LOWER('%${locationTerms[0]}%') THEN 3
            WHEN LOWER(state.name) LIKE LOWER('%${locationTerms[0]}%') THEN 4
            ELSE 5
          END`, 'ASC');
    }

    // Handle institution type searches
    if (institutionSynonyms.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          institutionSynonyms.forEach(synonym => {
            qb.orWhere('LOWER(inst.name) LIKE LOWER(:synonym)', { synonym: `%${synonym}%` })
              .orWhere('LOWER(category) LIKE LOWER(:synonym)', { synonym: `%${synonym}%` });
          });
        })
      );
    }

    // Handle single word searches
    if (primarySearchTerm) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(name) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(description) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(course.name) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(section.title) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(address) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` });
        })
      );
    }

    // Category section filter
    if (options.categorySection && options.categorySection?.trim().toLowerCase() !== 'all') {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb.orWhere('LOWER(section.title) LIKE LOWER(:synonym)', { synonym: `%${options.categorySection}%` });
        })
      );
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();
    queryBuilder = queryBuilder.skip(skip).take(limit);
    const data = await queryBuilder.getMany();

    return data;
  }

  async searchInstitutions(options: {
    keyword?: string;
    categorySection?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<CollegeSearchResponse> {
    // const { primarySearchTerm, locationTerms, institutionSynonyms, filters } =
    //   this.parseSearchQueryv5(options.keyword);
    const parsedQuery = await this.searchQueryService.parseSearchQueryv2(options.keyword);
    const { primarySearchTerm, locationTerms, institutionSynonyms, courseTerms, filters } = parsedQuery;


    // Initialize query builder
    let queryBuilder = this.collegeRepository
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.country', 'country')
      .leftJoinAndSelect('college.collegeCourses', 'collegeCourses')
      .leftJoinAndSelect('collegeCourses.course', 'course')
      .leftJoinAndSelect('college.performances', 'performance')
      .leftJoinAndSelect('college.categorySection', 'section');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      queryBuilder = queryBuilder.andWhere(`college.${key} = :${key}`, { [key]: value });
    });

    // Handle location search - PHASE 1: Filtering
    if (locationTerms.length > 0) {
      //const locationTerm = locationTerms[0];
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          locationTerms.forEach(locationTerm => {
            qb.orWhere('LOWER(college.city) LIKE LOWER(:locationTerm)', { locationTerm: `%${locationTerm}%` })
              .orWhere('LOWER(college.address) LIKE LOWER(:locationTerm)', { locationTerm: `%${locationTerm}%` })
              .orWhere('LOWER(district.name) LIKE LOWER(:locationTerm)', { locationTerm: `%${locationTerm}%` })
              .orWhere('LOWER(state.name) LIKE LOWER(:locationTerm)', { locationTerm: `%${locationTerm}%` })
              .orWhere('LOWER(country.name) LIKE LOWER(:locationTerm)', { locationTerm: `%${locationTerm}%` });
          });
        })
      );
    }
    
    // 3. Apply course term filters (most important - adds weight)
    if (courseTerms.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          courseTerms.forEach(courseTerm => {
            qb.orWhere('LOWER(course.name) LIKE LOWER(:courseTerm)', {
              courseTerm: `%${courseTerm}%`
            });
          });
        })
      );
    }

    // Handle institution type searches
    if (institutionSynonyms.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          institutionSynonyms.forEach(synonym => {
            qb.orWhere('LOWER(college.name) LIKE LOWER(:synonym)', { synonym: `%${synonym}%` })
              .orWhere('LOWER(college.category) LIKE LOWER(:synonym)', { synonym: `%${synonym}%` });
          });
        })
      );
    }

    // Handle single word searches
    if (primarySearchTerm) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('LOWER(college.name) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(college.description) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(course.name) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(section.title) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` })
            .orWhere('LOWER(college.address) LIKE LOWER(:term)', { term: `%${primarySearchTerm}%` });
        })
      );
    }

    // Category section filter
    if (options.categorySection && options.categorySection?.trim().toLowerCase() !== 'all') {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          qb.orWhere('LOWER(section.title) LIKE LOWER(:synonym)', { synonym: `%${options.categorySection}%` });
        })
      );
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // PHASE 2: Create a separate query for ordering and pagination
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 100;
    const skip = (page - 1) * limit;

    // Get just the IDs with proper ordering first
    let orderedIdsQuery = this.collegeRepository
      .createQueryBuilder('college')
      .select('college.id')
      .leftJoin('college.district', 'district')
      .leftJoin('college.state', 'state')
      .leftJoin('college.country', 'country')
      .leftJoin('college.collegeCourses', 'collegeCourses')
      .leftJoin('collegeCourses.course', 'course');


    // Extract and apply numeric filters from query
    const numericTerms = options.keyword?.match(/\b\d+\b/g) || [];
    if (numericTerms.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets(qb => {
          numericTerms.forEach(num => {
            const numericValue = parseInt(num);
            qb.orWhere('college.rating >= :num', { num: numericValue })
              .orWhere('college.zip = :num', { num })
              .orWhere('college.established = :num', { num: numericValue });
          });
        })
      );
    }
    
    /*if (locationTerms.length > 0) {
      const locationTerm = locationTerms[0];
      orderedIdsQuery
        .orderBy(`
        CASE
          WHEN LOWER(college.city) LIKE LOWER(:locationTerm) THEN 1
          WHEN LOWER(college.address) LIKE LOWER(:locationTerm) THEN 2
          WHEN LOWER(district.name) LIKE LOWER(:locationTerm) THEN 3
          WHEN LOWER(state.name) LIKE LOWER(:locationTerm) THEN 4
          WHEN LOWER(course.name) LIKE LOWER(:locationTerm) THEN 5
          WHEN LOWER(country.name) LIKE LOWER(:locationTerm) THEN 6
          ELSE 7
        END`, 'ASC')
        .setParameter('locationTerm', `%${locationTerm}%`);
    }
    else if (primarySearchTerm) {
      orderedIdsQuery
        .orderBy(`
        CASE
          WHEN LOWER(college.city) LIKE LOWER(:locationTerm) THEN 1
          WHEN LOWER(college.address) LIKE LOWER(:locationTerm) THEN 2
          WHEN LOWER(district.name) LIKE LOWER(:locationTerm) THEN 3
          WHEN LOWER(state.name) LIKE LOWER(:locationTerm) THEN 4
          WHEN LOWER(course.name) LIKE LOWER(:locationTerm) THEN 5
          WHEN LOWER(country.name) LIKE LOWER(:locationTerm) THEN 6
          ELSE 7
        END`, 'ASC')
        .setParameter('locationTerm', `%${primarySearchTerm}%`);
    }*/

    orderedIdsQuery = this.searchQueryService.addOrdering(orderedIdsQuery, parsedQuery);

    const orderedIds = await orderedIdsQuery.getMany();

    // Get full data for paginated results
    const data = await this.collegeRepository
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.country', 'country')
      .leftJoinAndSelect('college.collegeCourses', 'collegeCourses')
      .leftJoinAndSelect('collegeCourses.course', 'course')
      .where('college.id IN (:...ids)', { ids: orderedIds.map(c => c.id) })
      .addSelect('CASE college.id ' + 
        orderedIds.map((c, index) => `WHEN '${c.id}' THEN ${index}`).join(' ') + 
        ' ELSE 999999 END', 'custom_order')
      .orderBy('custom_order', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchCollegesById(options: {
    query: string;
    state?: string;
    district?: string;
    category?: string;
    rating?: number;
    courses?: string[];
    page: number;
    limit: number;
  }) {

    const query = this.collegeRepository.createQueryBuilder('college')
      .leftJoinAndSelect('college.state', 'state')
      .leftJoinAndSelect('college.district', 'district')
      .leftJoinAndSelect('college.categorySection', 'categorySection');

    if (options.query) {
      query.where(
        '(college.name ILIKE :query OR college.description ILIKE :query)',
        { query: `%${options.query}%` },
      );
    }

    if (options.state) {
      query.andWhere('state.id = :stateId', { stateId: options.state });
    }

    if (options.district) {
      query.andWhere('district.id = :districtId', { districtId: options.district });
    }

    if (options.category) {
      query.andWhere('categorySection.id = :categoryId', { categoryId: options.category });
    }

    if (options.category) {
      query.andWhere('college.category = :category', { category: options.category });
    }

    if (options.rating) {
      query.andWhere('college.rating >= :rating', { rating: options.rating });
    }

    if (options.courses && options.courses.length > 0) {
      query.andWhere('college.courses && :courses', { courses: options.courses });
    }

    const [data, total] = await query
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { data, total };
  }

  async findNearbyColleges(options: {
    latitude: number;
    longitude: number;
    radius: number;
    page: number;
    limit: number;
  }) {
    const query = this.collegeRepository
      .createQueryBuilder('college')
      .select()
      .addSelect(
        `(
          6371 * acos(
            cos(radians(:latitude)) * cos(radians(college.latitude)) *
            cos(radians(college.longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(college.latitude))
          )
        )`,
        'distance',
      )
      .having('distance <= :radius')
      .orderBy('distance', 'ASC')
      .setParameters({
        latitude: options.latitude,
        longitude: options.longitude,
        radius: options.radius,
      });

    const [data, total] = await query
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { data, total };
  }

  async getDistricts1(state: string) {
    const districts = await this.collegeRepository
      .createQueryBuilder('college')
      .select('DISTINCT college.district', 'district')
      .where('college.state = :state', { state })
      .getRawMany();

    return districts.map(d => d.district);
  }

  async getDistricts(stateId: string) {
    return await this.districtRepository.find({
      where: { state: { id: stateId } },
      select: ['id', 'name']
    });
  }

  async getStates() {
    return await this.stateRepository.find({
      select: ['id', 'name']
    });
  }

  async getCategorySections() {
    return await this.categorySectionRepository.find({
      relations: ['colleges']
    });
  }

  //common functions
  // Helper method to parse search query
  private parseSearchQuery(query: string): {
    searchTerms: string[];
    locationTerms: string[];
  } {
    const terms = query.split(/\s+/).filter(term => term.length > 0);

    // Identify location terms (simple approach - can be enhanced)
    const locationKeywords = ['near', 'in', 'at', 'around'];
    const locationTerms: string[] = [];
    const searchTerms: string[] = [];

    terms.forEach((term, index) => {
      if (locationKeywords.includes(term.toLowerCase()) && terms[index + 1]) {
        locationTerms.push(terms[index + 1]);
      } else if (!locationKeywords.includes(term.toLowerCase())) {
        searchTerms.push(term);
      }
    });

    return { searchTerms, locationTerms };
  }

  // Enhanced query parser in your service
  private parseSearchQueryv2(query: string): {
    searchTerms: string[];
    locationTerms: string[];
    filters: Record<string, string>;
  } {
    const result = {
      searchTerms: [] as string[],
      locationTerms: [] as string[],
      filters: {} as Record<string, string>
    };

    // Handle quoted phrases
    query = this.formatQuery(query); // Clean up the query
    const phrases = query.match(/"(.*?)"/g) || [];
    query = query.replace(/"(.*?)"/g, ''); // Remove phrases from original query

    // Process phrases
    phrases.forEach(phrase => {
      phrase = phrase.replace(/"/g, '').trim();
      if (this.isLocationPhrase(phrase)) {
        result.locationTerms.push(phrase);
        // Add singular form if plural
        const singular = this.singularize(phrase);
        if (singular !== phrase) {
          result.locationTerms.push(singular);
        }
      } else {
        result.searchTerms.push(phrase);
        // Add singular form if plural
        const singular = this.singularize(phrase);
        if (singular !== phrase) {
          result.searchTerms.push(singular);
        }
      }
    });

    // Process remaining terms
    const terms = query.split(/\s+/).filter(term => term.length > 0);
    terms.forEach(term => {
      if (this.isLocationTerm(term)) {
        result.locationTerms.push(term);
        // Add singular form if plural
        const singular = this.singularize(term);
        if (singular !== term) {
          result.locationTerms.push(singular);
        }
      } else if (term.includes(':')) {
        // Handle filters like "rating:4.5"
        const [key, value] = term.split(':');
        result.filters[key] = value;
      } else {
        result.searchTerms.push(term);
        // Add singular form if plural
        const singular = this.singularize(term);
        if (singular !== term) {
          result.searchTerms.push(singular);
        }
      }
    });

    return result;
  }

  private parseSearchQueryv4(query: string): {
    primarySearchTerm: string | null;
    locationTerms: string[];
    institutionSynonyms: string[];
    filters: Record<string, string>;
  } {
    const result = {
      primarySearchTerm: null as string | null,
      locationTerms: [] as string[],
      institutionSynonyms: [] as string[],
      filters: {} as Record<string, string>
    };

    // Clean and normalize the query
    query = this.formatQuery(query).toLowerCase();

    // Extract and remove filters first (e.g., "rating:4.5")
    const filterRegex = /(\w+):([^\s]+)/g;
    let match;
    while (match = filterRegex.exec(query)) {
      result.filters[match[1]] = match[2];
      query = query.replace(match[0], '');
    }

    // List of common educational institution terms (both singular and plural)
    const institutionTerms = [
      'college', 'colleges',
      'school', 'schools',
      'institute', 'institutes',
      'institution', 'institutions',
      'university', 'universities',
      'academy', 'academies'
    ];

    // Check if query contains location indicators
    const locationIndicators = ['in', 'near', 'at', 'around', 'within'];
    const hasLocation = locationIndicators.some(indicator =>
      query.includes(` ${indicator} `)
    );

    // If no explicit location, try to detect location terms
    if (!hasLocation) {
      const potentialLocations = query.split(/\s+/).filter(term =>
        term.length > 0 && !institutionTerms.includes(term)
      );

      if (potentialLocations.length > 0) {
        result.locationTerms = potentialLocations;
        result.primarySearchTerm = null;
        return result;
      }
    }

    // Process location-based queries
    if (hasLocation) {
      const parts = query.split(/\s+/);
      const locationIndex = parts.findIndex(part =>
        locationIndicators.includes(part)
      );

      if (locationIndex !== -1) {
        // Everything before location indicator becomes search terms
        const searchParts = parts.slice(0, locationIndex);
        result.institutionSynonyms = this.getInstitutionSynonyms(searchParts.join(' '));

        // Everything after becomes location terms
        result.locationTerms = parts.slice(locationIndex + 1);
        return result;
      }
    }

    // Default case for single word queries
    if (query.split(/\s+/).length === 1) {
      if (institutionTerms.includes(query)) {
        result.institutionSynonyms = this.getInstitutionSynonyms(query);
      } else {
        result.primarySearchTerm = query;
      }
    }

    return result;
  }

  private parseSearchQueryv5(query: string): {
    primarySearchTerm: string | null;
    locationTerms: string[];
    institutionSynonyms: string[];
    filters: Record<string, string>;
  } {
    const result = {
      primarySearchTerm: null as string | null,
      locationTerms: [] as string[],
      institutionSynonyms: [] as string[],
      filters: {} as Record<string, string>
    };

    // Clean and normalize the query
    query = this.formatQuery(query).toLowerCase();

    // 1. First extract and remove any explicit filters (e.g., "rating:4.5")
    const filterRegex = /(\w+):([^\s]+)/g;
    let match;
    while ((match = filterRegex.exec(query))) {
      result.filters[match[1]] = match[2];
      query = query.replace(match[0], '');
    }

    // 2. Handle quoted phrases (exact matches)
    const phrases = query.match(/"(.*?)"/g) || [];
    query = query.replace(/"(.*?)"/g, '').trim();

    phrases.forEach(phrase => {
      phrase = phrase.replace(/"/g, '').trim();
      if (this.isLocationPhrase(phrase)) {
        result.locationTerms.push(phrase);
      } else {
        // For quoted phrases that aren't locations, add to both search terms and synonyms
        result.primarySearchTerm = phrase;
        result.institutionSynonyms.push(...this.getInstitutionSynonyms(phrase));
      }
    });

    // 3. Process remaining terms
    const terms = query.split(/\s+/).filter(term => term.length > 0);

    // Special handling for course/program names (multi-word terms)
    if (terms.length > 1 && !this.hasLocationIndicators(terms)) {
      // If it's a multi-word query without location indicators, treat as course/program search
      const combinedTerm = terms.join(' ');
      result.primarySearchTerm = combinedTerm;
      result.institutionSynonyms.push(...this.getInstitutionSynonyms(combinedTerm));
    } else {
      // Standard term processing
      terms.forEach(term => {
        if (this.isLocationTerm(term)) {
          result.locationTerms.push(term);
        } else if (term.includes(':')) {
          // Handle any remaining filters that weren't caught earlier
          const [key, value] = term.split(':');
          result.filters[key] = value;
        } else {
          result.primarySearchTerm = result.primarySearchTerm 
            ? `${result.primarySearchTerm} ${term}` 
            : term;
          result.institutionSynonyms.push(...this.getInstitutionSynonyms(term));
        }
      });
    }

    // 4. If we have location terms but no primary search term, 
    // treat the first location term as a search term too
    if (result.locationTerms.length > 0 && !result.primarySearchTerm) {
      result.primarySearchTerm = result.locationTerms[0];
    }

    return result;
  }

  private getInstitutionSynonyms(term: string): string[] {
    const synonymGroups = [
      ['college', 'colleges'],
      ['school', 'schools'],
      ['institute', 'institutes'],
      ['institution', 'institutions'],
      ['university', 'universities'],
      ['academy', 'academies']
    ];

    term = term.toLowerCase();
    for (const group of synonymGroups) {
      if (group.includes(term)) {
        return group;
      }
    }
    return [term];
  }

  // Basic singularization function - you may want to use a library for more accuracy
  private singularize(word: string): string {
    // Common plural to singular conversions
    const pluralToSingular: Record<string, string> = {
      colleges: 'college',
      universities: 'university',
      schools: 'school',
      courses: 'course',
      programs: 'program',
      // Add more mappings as needed
    };

    return pluralToSingular[word.toLowerCase()] || word;
  }

  private parseSearchQueryV3(query: string): {
    searchTerms: string[];
    locationTerms: string[];
  } {
    // Normalize the query
    const normalized = query.toLowerCase().trim();

    // Initialize results
    const result = {
      searchTerms: [] as string[],
      locationTerms: [] as string[]
    };

    // Check for location patterns
    const locationPatterns = [
      /(?:colleges?|schools?|institutes?) (?:in|near|at) ([a-zA-Z\s]+)/,
      /(?:colleges?|schools?|institutes?) ([a-zA-Z\s]+)/,
      /([a-zA-Z\s]+) (?:colleges?|schools?|institutes?)/
    ];

    for (const pattern of locationPatterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        result.locationTerms.push(match[1].trim());
        break;
      }
    }

    // If no location found, treat all as search terms
    if (result.locationTerms.length === 0) {
      result.searchTerms = query.split(/\s+/).filter(term => term.length > 0);
    } else {
      // Remove location terms from general search
      const locationPhrase = result.locationTerms[0];
      const remainingQuery = normalized.replace(
        new RegExp(`(?:colleges?|schools?|institutes?) (?:in|near|at) ${locationPhrase}`),
        ''
      ).trim();

      if (remainingQuery) {
        result.searchTerms = remainingQuery.split(/\s+/).filter(term => term.length > 0);
      }
    }

    return result;
  }

  private hasLocationIndicators(terms: string[]): boolean {
    const locationIndicators = ['in', 'near', 'at', 'around', 'within'];
    return terms.some(term => locationIndicators.includes(term));
  }

  private isLocationTerm(term: string): boolean {
    const locationIndicators = ['near', 'in', 'at', 'around', 'within', 'close to' ];
    return locationIndicators.includes(term.toLowerCase());
  }

  private isLocationPhrase(phrase: string): boolean {
    // Simple check - could be enhanced with location dictionary
    return phrase.split(' ').some(word => this.isLocationTerm(word));
  }

  // Add to your service
  private rankColleges(colleges: College[], searchTerms: string[]): College[] {
    return colleges.map(college => {
      let score = 0;

      // Name matches score highest
      searchTerms.forEach(term => {
        if (college.name.toLowerCase().includes(term.toLowerCase())) {
          score += 3;
        }
      });

      // Description matches
      searchTerms.forEach(term => {
        if (college.description.toLowerCase().includes(term.toLowerCase())) {
          score += 1;
        }
      });

      // Location matches
      searchTerms.forEach(term => {
        if (college.city.toLowerCase().includes(term.toLowerCase()) ||
          college.district?.name.toLowerCase().includes(term.toLowerCase())) {
          score += 2;
        }
      });

      return { ...college, _searchScore: score };
    })
      .sort((a, b) => b._searchScore - a._searchScore)
      .map(college => {
        const { _searchScore, ...rest } = college;
        return rest;
      });
  }

  private filterStopWords(query: string): string {
    const stopWords1 = ['the', 'is', 'in', 'at', 'of', 'and', 'a', 'to'];
    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'location'
    ]);
    const words = query.split(/\s+/);
    const filteredWords = words.filter(word => !stopWords.has(word.toLowerCase()));
    return filteredWords.join(' ');
    // return query
    //   .split(' ')
    //   .filter(word => !stopWords1.includes(word.toLowerCase()))
    //   .join(' ');
  }
  private removeSpecialChars(query: string): string {
    return query.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  private removeExtraSpaces(query: string): string {
    return query.replace(/\s+/g, ' ').trim();
  }
  private formatQuery(query: string): string {
    return this.removeExtraSpaces(this.removeSpecialChars(this.filterStopWords(query)));
  }

  // Helper to extract search terms (including phrases in quotes)
  private extractSearchTerms(searchText: string): string[] {
    // Match phrases in quotes and individual words
    const phraseMatches = searchText.match(/"(.*?)"/g) || [];
    const remainingText = searchText.replace(/"(.*?)"/g, '');

    const phrases = phraseMatches.map(phrase =>
      phrase.replace(/"/g, '').trim()
    ).filter(phrase => phrase.length > 0);

    const words = remainingText.split(/\s+/)
      .filter(word => word.length > 0);

    return [...phrases, ...words];
  }
}