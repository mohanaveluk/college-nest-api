import { ApiProperty } from "@nestjs/swagger";
import { College } from "../entities/college.entity";

export class Pagination {
    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export class CollegeSearchResponse {
    @ApiProperty({ type: [College] })
    data: College[];

    @ApiProperty({ type: Pagination })
    pagination: Pagination
}