import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentCategoriesController } from './treatment-categories.controller';

describe('TreatmentCategoriesController', () => {
  let controller: TreatmentCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentCategoriesController],
    }).compile();

    controller = module.get<TreatmentCategoriesController>(TreatmentCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
