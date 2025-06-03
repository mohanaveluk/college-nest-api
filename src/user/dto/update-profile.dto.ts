import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsOptional()
  @MinLength(2)
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsOptional()
  @MinLength(2)
  last_name?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail({}, {
    message: 'Please provide a valid email address'
  })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    {
      message: 'Invalid email format. Example: user@example.com'
    }
  )
  email?: string;

  
  @ApiProperty({
    example: '+1',
    description: 'US country code',
  })
  @IsOptional()
  @Matches(/^\+\d{1,3}$/, {
    message: 'Country code must be in format: +XX (max of 3 digits)'
  })
  @IsString()
  country_code?: string;


  @ApiProperty({
    example: '1234567890',
    description: 'US mobile number with country code',
  })
  @IsOptional()
  //@Matches(/^\d{10}$/, {
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be in format: XXXXXXXXXX (10 digits number)'
  })
  mobile?: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'User major/field of study',
  })
  @IsOptional()
  @MinLength(2)
  major?: string;

  @ApiProperty({
    example: '******',
    description: 'User password',
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    example: 'image url',
    description: 'user profile image link/url',
  })
  @IsOptional()
  profileImage?: string;
}