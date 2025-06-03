import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCollegesByCategoryDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'Category section IDs (comma-separated for multiple)'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(',');
  })
  @IsArray()
  @IsUUID(4, { each: true })
  category_section_ids?: string[];
  
}