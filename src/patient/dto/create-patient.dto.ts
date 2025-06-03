import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export class CreatePatientDto {
  @ApiProperty({ description: 'Patient first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Patient last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Patient date of birth' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({ description: 'Patient gender', enum: Gender })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({ description: 'Patient email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Patient phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Patient address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Insurance provider', required: false })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiProperty({ description: 'Insurance number', required: false })
  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @ApiProperty({ description: 'Insurance expiry date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  insuranceExpiryDate?: Date;

  @ApiProperty({ description: 'Medical history', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalHistory?: string[];

  @ApiProperty({ description: 'Allergies', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({ description: 'Chronic conditions', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @ApiProperty({ description: 'Current medications', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];
}