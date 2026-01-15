import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordTreatmentsService } from './medical-record-treatments.service';

describe('MedicalRecordTreatmentsService', () => {
  let service: MedicalRecordTreatmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordTreatmentsService],
    }).compile();

    service = module.get<MedicalRecordTreatmentsService>(
      MedicalRecordTreatmentsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
