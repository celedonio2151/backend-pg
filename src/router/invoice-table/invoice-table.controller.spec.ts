import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTableController } from './invoice-table.controller';
import { InvoiceTableService } from './invoice-table.service';

describe('InvoiceTableController', () => {
  let controller: InvoiceTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceTableController],
      providers: [InvoiceTableService],
    }).compile();

    controller = module.get<InvoiceTableController>(InvoiceTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
