import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentCategoriesService } from './treatment-categories.service';

describe('TreatmentCategoriesService', () => {
  let service: TreatmentCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreatmentCategoriesService],
    }).compile();

    service = module.get<TreatmentCategoriesService>(TreatmentCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
