import { Injectable } from '@nestjs/common';
import { CourseSearchService, LocationService } from './location-service';
import { SelectQueryBuilder } from 'typeorm';
import { College } from './entities/college.entity';

export interface ParsedQuery {
  primarySearchTerm: string | null;
  locationTerms: string[];
  institutionSynonyms: string[];
  courseTerms: string[];
  filters: Record<string, string>;
}

@Injectable()
export class SearchQueryService {

    constructor(
        private locationService: LocationService,
        private courseService: CourseSearchService
    ){
        
    }

    async parseSearchQueryv2(query: string): Promise<ParsedQuery> {
        const result: ParsedQuery = {
            primarySearchTerm: null,
            locationTerms: [],
            institutionSynonyms: [],
            courseTerms: [],
            filters: {}
        };

        if(!query) return result;
        // 1. Extract and remove filters first (e.g., "rating:4.5")
        query = this.extractFilters(query, result.filters);

        // 2. Handle quoted phrases
        const phrases = query.match(/"(.*?)"/g) || [];
        query = query.replace(/"(.*?)"/g, '').trim();
        await this.processPhrases(phrases, result);

        // 3. Process remaining terms
        const terms = query.split(/\s+/).filter(term => term.length > 0);
        await this.processTerms(terms, result);

        // 4. Final validation and cleanup
        this.validateResults(result);

        return result;
    }



    parseSearchQueryv2_1(query: string): {
        primarySearchTerm: string | null;
        locationTerms: string[];
        institutionSynonyms: string[];
        filters: Record<string, string>;
    } {
        const result = {
            primarySearchTerm: null as string | null,
            locationTerms: [] as string[],
            institutionSynonyms: [] as string[],
            courseTerms: [],
            filters: {} as Record<string, string>
        };

        // 1. First extract and remove any explicit filters
        query = this.extractFilters(query, result.filters);

        // 2. Handle quoted phrases
        const phrases = query.match(/"(.*?)"/g) || [];
        query = query.replace(/"(.*?)"/g, '').trim();
        this.processPhrases(phrases, result);

        // 3. Process remaining terms with enhanced location detection
        const terms = query.split(/\s+/).filter(term => term.length > 0);
        this.processTerms(terms, result);

        // 4. Final validation and cleanup
        this.validateResults(result);

        return result;
    }

    private extractFilters(query: string, filters: Record<string, string>): string {
        const filterRegex = /(\w+):([^\s]+)/g;
        let match;
        while ((match = filterRegex.exec(query))) {
            filters[match[1]] = match[2];
            query = query.replace(match[0], '');
        }
        return query;
    }

    private async processPhrases(phrases: string[], result: ParsedQuery) {
        for (const phrase of phrases) {
            const cleanPhrase = phrase.replace(/"/g, '').trim();
            if (await this.isKnownLocation(cleanPhrase)) {
                result.locationTerms.push(cleanPhrase);
            } else if (await this.isCourseName(cleanPhrase)) {
                result.courseTerms.push(cleanPhrase);
            } else {
                result.primarySearchTerm = cleanPhrase;
                result.institutionSynonyms.push(...this.getInstitutionSynonyms(cleanPhrase));
            }
        }
    }

    private async processTerms(terms: string[], result: ParsedQuery) {
        const locationIndicators = ['in', 'near', 'at', 'around', 'within'];
        const indicatorIndex = terms.findIndex(term => locationIndicators.includes(term.toLowerCase()));

        // Case 1: Explicit location pattern ("X in Y")
        if (indicatorIndex !== -1 && terms.length > indicatorIndex + 1) {
            const searchTerms = terms.slice(0, indicatorIndex);
            const locationCandidate = terms.slice(indicatorIndex + 1).join(' ');

            if (await this.isKnownLocation(locationCandidate)) {
                result.locationTerms.push(locationCandidate);
                result.primarySearchTerm = searchTerms.join(' ');
            }
        }
        // Case 2: Implicit location or course terms
        else {
            const searchTerms = [];

            for (const term of terms) {
                if (await this.isKnownLocation(term)) {
                    result.locationTerms.push(term);
                } else if (await this.isCourseName(term)) {
                    result.courseTerms.push(term);
                } else {
                    searchTerms.push(term);
                }
            }

            if (searchTerms.length > 0) {
                result.primarySearchTerm = searchTerms.join(' ');
            }
        }
    }

    private validateResults(result: ParsedQuery) {
        if (result.locationTerms.length > 0 && !result.primarySearchTerm) {
            result.primarySearchTerm = result.locationTerms[0];
        }

        // Generate institution synonyms if we have search terms
        if (result.primarySearchTerm) {
            result.institutionSynonyms.push(...this.getInstitutionSynonyms(result.primarySearchTerm));
        }

        // Remove duplicates
        result.locationTerms = [...new Set(result.locationTerms)];
        result.courseTerms = [...new Set(result.courseTerms)];
        result.institutionSynonyms = [...new Set(result.institutionSynonyms)];
    }

    private async isKnownLocation(term: string): Promise<boolean> {
        return this.locationService.isKnownLocation(term.toLowerCase());
    }

    private async isCourseName(term: string): Promise<boolean> {
        return this.courseService.courseNameExists(term.toLowerCase());
    }

    // Enhanced location detection
    private isLocation(term: string): boolean {
        // Check against a database of known locations
        const knownLocations = ['theni', 'mumbai', 'chennai', 'delhi']; // Should come from a database

        // Check for location indicators
        const locationIndicators = ['in', 'near', 'at', 'around', 'within'];

        return knownLocations.includes(term.toLowerCase()) ||
            locationIndicators.includes(term.toLowerCase());
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


    addOrdering(queryBuilder: SelectQueryBuilder<College>, parsedQuery: ParsedQuery) {
        let orderBy = '';
        const params: Record<string, any> = {};
        let priority = 0;

        // 1. Highest priority: Exact course name matches
        if (parsedQuery.courseTerms.length > 0) {
            parsedQuery.courseTerms.forEach((term, i) => {
                const paramName = `courseTerm${i}`;
                orderBy += `WHEN LOWER(course.name) LIKE LOWER(:${paramName}) THEN ${priority++}\n`;
                params[paramName] = `%${term}%`;
            });
        }

        // 2. Location-based ordering (if location terms exist)
        if (parsedQuery.locationTerms.length > 0) {
            const locationTerm = parsedQuery.locationTerms[0];
            params.locationTerm = `%${locationTerm}%`;

            orderBy += `WHEN LOWER(college.city) LIKE LOWER(:locationTerm) THEN ${priority++}\n`;
            orderBy += `WHEN LOWER(college.address) LIKE LOWER(:locationTerm) THEN ${priority++}\n`;
            orderBy += `WHEN LOWER(district.name) LIKE LOWER(:locationTerm) THEN ${priority++}\n`;
            orderBy += `WHEN LOWER(state.name) LIKE LOWER(:locationTerm) THEN ${priority++}\n`;
            orderBy += `WHEN LOWER(country.name) LIKE LOWER(:locationTerm) THEN ${priority++}\n`;
        }

        // 3. Primary search term matches
        if (parsedQuery.primarySearchTerm) {
            params.primaryTerm = `%${parsedQuery.primarySearchTerm}%`;
            orderBy += `WHEN LOWER(college.name) LIKE LOWER(:primaryTerm) THEN ${priority++}\n`;
            orderBy += `WHEN LOWER(college.description) LIKE LOWER(:primaryTerm) THEN ${priority++}\n`;
        }

        // 4. Institution synonyms
        if (parsedQuery.institutionSynonyms.length > 0) {
            parsedQuery.institutionSynonyms.forEach((synonym, i) => {
                const paramName = `synonym${i}`;
                params[paramName] = `%${synonym}%`;
                orderBy += `WHEN LOWER(college.name) LIKE LOWER(:${paramName}) THEN ${priority++}\n`;
            });
        }

        // Apply ordering if we have any conditions
        if (orderBy) {
            queryBuilder = queryBuilder
                //.leftJoin('college.country', 'country') // Ensure country join exists
                .addSelect(`CASE\n${orderBy}ELSE ${priority}\nEND`, 'match_priority')
                .setParameters(params)
                .orderBy('match_priority', 'ASC')
                .addOrderBy('college.name', 'ASC'); // Secondary sort
        } else {
            // Default ordering when no specific matches
            queryBuilder = queryBuilder.orderBy('college.name', 'ASC');
        }

        return queryBuilder;
    }


}