import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordTreatmentsController } from './medical-record-treatments.controller';

describe('MedicalRecordTreatmentsController', () => {
  let controller: MedicalRecordTreatmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordTreatmentsController],
    }).compile();

    controller = module.get<MedicalRecordTreatmentsController>(MedicalRecordTreatmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
