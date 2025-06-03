import { ApiProperty } from "@nestjs/swagger";
import { match } from "assert";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateShareDto {
    @ApiProperty({
        example: 'bb9e8501-6e09-48ce-a7c8-da4677bb4ed4',
        description: 'Unique identifier for the college',
        required: true
    })
    @IsString({
        message: 'College ID must be a string'
    })
    @IsNotEmpty({
        message: 'College ID is required'
    })
    college_id: string;

    @ApiProperty({})
    @IsString()
    @IsOptional()
    notes: string;

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
        example: 'https://example.com',
        description: 'URL to share',
        required: true
    })
    @IsString({
        message: 'URL must be a string'
    })
    @IsNotEmpty({
        message: 'URL is required'
    })
    @Matches(/^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w.-]*)*\/?$/, {
        message: 'Invalid URL format. Example: https://example.com'
    })
    url: string;
}