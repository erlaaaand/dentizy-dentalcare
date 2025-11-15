import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from '../dto/find-appointments-query.dto';
import { AppointmentResponseDto, PaginatedAppointmentResponseDto } from '../dto/appointment-response.dto';
import { User } from '../../../users/domains/entities/user.entity';
import { AppointmentCreationService } from '../use-cases/appointment-creation.service';
import { AppointmentCompletionService } from '../use-cases/appointment-completion.service';
import { AppointmentCancellationService } from '../use-cases/appointment-cancellation.service';
import { AppointmentFindService } from '../use-cases/appointment-find.service';
import { AppointmentSearchService } from '../use-cases/appointment-search.service';
import { AppointmentUpdateService } from '../use-cases/appointment-update.service';
import { AppointmentDeletionService } from '../use-cases/appointment-deletion.service';
import { AppointmentMapper } from '../../domains/mappers/appointment.mapper';

/**
 * Orchestrator Service untuk Appointments
 * Koordinasi antar use cases dan mapping responses
 */
@Injectable()
export class AppointmentsService {
    constructor(
        private readonly creationService: AppointmentCreationService,
        private readonly completionService: AppointmentCompletionService,
        private readonly cancellationService: AppointmentCancellationService,
        private readonly findService: AppointmentFindService,
        private readonly searchService: AppointmentSearchService,
        private readonly updateService: AppointmentUpdateService,
        private readonly deletionService: AppointmentDeletionService,
        private readonly mapper: AppointmentMapper,
    ) { }

    /**
     * Create new appointment
     */
    async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
        const appointment = await this.creationService.execute(dto);
        return this.mapper.toResponseDto(appointment);
    }

    /**
     * Complete appointment (status → SELESAI)
     */
    async complete(id: number, user: User): Promise<AppointmentResponseDto> {
        const appointment = await this.completionService.execute(id, user);
        return this.mapper.toResponseDto(appointment);
    }

    /**
     * Cancel appointment (status → DIBATALKAN)
     */
    async cancel(id: number, user: User): Promise<AppointmentResponseDto> {
        const appointment = await this.cancellationService.execute(id, user);
        return this.mapper.toResponseDto(appointment);
    }

    /**
     * Find all appointments dengan filters
     */
    async findAll(
        user: User,
        queryDto: FindAppointmentsQueryDto
    ): Promise<PaginatedAppointmentResponseDto> {
        const result = await this.searchService.execute(user, queryDto);

        return this.mapper.toPaginatedResponse(
            result.data,
            result.count,
            result.page,
            result.limit
        );
    }

    /**
     * Find appointment by ID
     */
    async findOne(id: number, user: User): Promise<AppointmentResponseDto> {
        const appointment = await this.findService.execute(id, user);
        return this.mapper.toResponseDto(appointment);
    }

    /**
     * Update appointment
     */
    async update(
        id: number,
        dto: UpdateAppointmentDto
    ): Promise<AppointmentResponseDto> {
        const appointment = await this.updateService.execute(id, dto);
        return this.mapper.toResponseDto(appointment);
    }

    /**
     * Delete appointment
     */
    async remove(id: number, user: User): Promise<void> {
        await this.deletionService.execute(id, user);
    }
}