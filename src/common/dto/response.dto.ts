import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result of the operation',
    example: 'Data created successfully'
  })
  message: string;

  @ApiProperty({
    description: 'The data returned by the operation',
    required: false
  })
  data: T | null;

  @ApiProperty({
    description: 'Error message if the operation failed',
    required: false,
    example: 'Failed to create data'
  })
  error?: string;

  constructor(success: boolean, message: string, data: T | null, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}