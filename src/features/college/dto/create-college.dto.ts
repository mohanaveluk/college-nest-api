import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, IsLatLong, IsEmail, IsUrl, Min, Max, isString, ValidateNested, isBoolean } from 'class-validator';
import { CollegeCourseDto } from 'src/features/course/dto/college-course.dto';

export enum CollegeCategory {
  DEEMED = 'deemed',
  AFFILIATED = 'affiliated',
  AUTONOMOUS = 'autonomous',
  OTHER = 'other'
}

export class CreateCollegeDto {
  @ApiProperty()
  @IsNumber()
  code: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state_id: string;

  @ApiProperty()
  @IsNumber()
  zip: number;

  @ApiProperty()
  @IsString()
  district_id: string;

  @ApiProperty()
  @IsString()
  country_id: string;

  @ApiProperty({ enum: CollegeCategory })
  @IsEnum(CollegeCategory)
  category: CollegeCategory;

  @ApiProperty()
  @IsString()
  category_section_id: string;

  @ApiProperty()
  @IsNumber()
  //@Transform(({ value }) => parseFloat(value.toFixed(2)))
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsNumber()
  established: number;
  
  @ApiProperty({ type: [CollegeCourseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollegeCourseDto)
  courses: CollegeCourseDto[];

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsUrl()
  website: string;

  @ApiProperty({ example: "40.7128" })
  @IsString()
  //@IsNumber({}, { message: 'Latitude must be a number' })
  //@Min(-90, { message: 'Latitude must be between -90 and 90' })
  //@Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: string;

  @ApiProperty({ example: "-74.0060" })
  @IsString()
  //@IsNumber({}, { message: 'Longitude must be a number' })
  //@Min(-180, { message: 'Longitude must be between -180 and 180' })
  //@Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  created_by?: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  updated_at?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  created_at?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deleted_at?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deleted_by?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  deleted?: boolean;

}