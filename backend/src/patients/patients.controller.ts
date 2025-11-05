import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../roles/entities/role.entity';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    @Roles(UserRole.STAF)
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientsService.create(createPatientDto);
    }

    @Get()
    findAll() {
        return this.patientsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientsService.update(+id, updatePatientDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.patientsService.remove(+id);
    }
}