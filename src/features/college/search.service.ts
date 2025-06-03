import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from './entities/college.entity';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { CategorySection } from './entities/category-section.entity';
import { CollegeSearchResponse } from './dto/college-search-response';

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
      } else {
        result.searchTerms.push(phrase);
      }
    });

    // Process remaining terms
    const terms = query.split(/\s+/).filter(term => term.length > 0);
    terms.forEach(term => {
      if (this.isLocationTerm(term)) {
        result.locationTerms.push(term);
      } else if (term.includes(':')) {
        // Handle filters like "rating:4.5"
        const [key, value] = term.split(':');
        result.filters[key] = value;
      } else {
        result.searchTerms.push(term);
      }
    });

    return result;
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

  private isLocationTerm(term: string): boolean {
    const locationIndicators = ['near', 'in', 'at', 'around', 'within'];
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