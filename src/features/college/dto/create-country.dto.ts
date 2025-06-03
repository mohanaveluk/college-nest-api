import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}