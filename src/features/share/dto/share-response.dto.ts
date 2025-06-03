import { ApiProperty } from "@nestjs/swagger";

export class ShareResponseDto {
    @ApiProperty({
        description: 'email sent status ',
        example: 'success',
        enum: ['success', 'error'],
        
    })
    status: string;
    
    @ApiProperty({
        description: 'email address to which the share is sent',
        example: ''
    })
    email: string;
    
    @ApiProperty({
        description: 'URL to share',
        example: 'https://example.com/share/12345',
    })
    url: string;

    @ApiProperty({
        description: 'Unique identifier for the share',
        example: '12345',
    })
    shareId: string;
    @ApiProperty({
        description: 'Notes provided by the user',
        example: 'Check out this college!',
        required: false
    })
    notes?: string;
    @ApiProperty({
        description: 'College ID associated with the share',
        example: 'bb9e8501-6e09-48ce-a7c8-da4677bb4ed4',
    })
    college_id: string;

    @ApiProperty({
        description: 'College name associated with the share',
        example: 'example university',
    })
    college_name: string;

    @ApiProperty({
        description: 'Timestamp of when the share was created',
        example: '2023-10-01T12:00:00Z',
    })
    created_at?: Date;

    @ApiProperty({
        description: 'User email address',
        example: ''

    })
    userEmail: string;

    
}