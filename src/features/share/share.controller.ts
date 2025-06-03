import { Controller, Post, Body, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('share')
@Controller('share')
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    @Post('friend')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Share college information to a friend' })
    @ApiResponse({ status: 200, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation error or email exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })

    async sendEmail(@Request() req, @Body() createShareDto: CreateShareDto): Promise<any> {
        try {
            await this.shareService.create(req.user.uguid, createShareDto);
            return { status: 'success', message: 'Email sent successfully' };
        } catch (error) {
            throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}