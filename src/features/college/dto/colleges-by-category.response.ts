import { ApiProperty } from '@nestjs/swagger';
import { College } from '../entities/college.entity';
import { CategorySection } from '../entities/category-section.entity';

export class CategorySectionWithColleges {
  @ApiProperty({ type: CategorySection })
  //categorySection: CategorySection;
  categorySection: Omit<CategorySection, 'colleges'>; // Remove circular reference

  @ApiProperty({ type: [College] })
  colleges: College[];
}

export class CollegesByCategoryResponse {
  @ApiProperty({ type: [CategorySectionWithColleges] })
  results: CategorySectionWithColleges[];
}