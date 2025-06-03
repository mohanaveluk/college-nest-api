import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
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
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (minimum 10 characters)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long'
  })
  password: string;

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
    description: 'US mobile number',
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Mobile number must be in format: XXXXXXXXXX (10 digits after country code)'
  })
  @IsString()
  mobile?: string;

  @ApiProperty({
    example: new Date(),
    description: 'User creation timestamp',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date = new Date();

  @ApiProperty({
    example: null,
    description: 'User last update timestamp',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @ApiProperty({
    example: 'kjdfkjkdf',
    description: 'User role guid',
    required: true,
    nullable: false,
  })
  @IsOptional()
  role_id: string;
}