import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactDto } from './dto/contact.dto';
import { Public } from '../common/decorators/public.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({ status: 201, description: 'Contact form submitted successfully' })
  async create(@Body() contactDto: ContactDto): Promise<ResponseDto<any>> {
    try {
      const result = await this.contactService.create(contactDto);
      return new ResponseDto(true, 'Contact form submitted successfully', result, null);
    } catch (error) {
      return new ResponseDto(false, 'Failed to submit contact form', null, error.message);
    }
  }
}