import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CollegeCourseDto {

    @ApiProperty()
    @IsNotEmpty({ message: "Course ID is required" })
    course_id: string;
        
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