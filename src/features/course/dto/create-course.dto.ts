import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsNumber()
  course_code: string;

  @ApiProperty()
  @IsString()
  course_name: string;
}