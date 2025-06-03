import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreatePerformanceDto {
  @ApiProperty()
  @IsString()
  college_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  placements: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  research: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  infrastructure: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  teaching: number;

}