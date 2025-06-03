import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    StreamableFile,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { PatientService } from './patient.service';
  import { CreatePatientDto } from './dto/create-patient.dto';
  import { UpdatePatientDto } from './dto/update-patient.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { ResponseDto } from '../common/dto/response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
  
  @ApiTags('patients')
  @Controller('patients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  export class PatientController {
    constructor(private readonly patientService: PatientService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new patient' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Patient created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    async create(@Body() createPatientDto: CreatePatientDto): Promise<ResponseDto<any>> {
      try {
        const patient = await this.patientService.create(createPatientDto);
        return new ResponseDto(true, 'Patient created successfully', patient, null);
      } catch (error) {
        return new ResponseDto(false, 'Failed to create patient', null, error.message);
      }
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all patients' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Retrieved all patients' })
    async findAll(): Promise<ResponseDto<any>> {
      try {
        const patients = await this.patientService.findAll();
        return new ResponseDto(true, 'Patients retrieved successfully', patients, null);
      } catch (error) {
        return new ResponseDto(false, 'Failed to retrieve patients', null, error.message);
      }
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get patient by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Retrieved patient' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
    async findOne(@Param('id') id: string): Promise<ResponseDto<any>> {
      try {
        const patient = await this.patientService.findOne(id);
        return new ResponseDto(true, 'Patient retrieved successfully', patient, null);
      } catch (error) {
        return new ResponseDto(false, 'Failed to retrieve patient', null, error.message);
      }
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update patient' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Patient updated successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    async update(
      @Param('id') id: string,
      @Body() updatePatientDto: UpdatePatientDto,
    ): Promise<ResponseDto<any>> {
      try {
        const patient = await this.patientService.update(id, updatePatientDto);
        return new ResponseDto(true, 'Patient updated successfully', patient, null);
      } catch (error) {
        return new ResponseDto(false, 'Failed to update patient', null, error.message);
      }
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete patient' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Patient deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
    async remove(@Param('id') id: string): Promise<ResponseDto<any>> {
      try {
        await this.patientService.remove(id);
        return new ResponseDto(true, 'Patient deleted successfully', null, null);
      } catch (error) {
        return new ResponseDto(false, 'Failed to delete patient', null, error.message);
      }
    }
  
    @Get(':id/summary')
    @ApiOperation({ summary: 'Generate patient summary PDF' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Generated patient summary' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
    async generateSummary(@Param('id') id: string): Promise<StreamableFile> {
      const buffer = await this.patientService.generatePatientSummary(id);
      return new StreamableFile(buffer);
    }
  }