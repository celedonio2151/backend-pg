import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTableService } from './invoice-table.service';

describe('InvoiceTableService', () => {
  let service: InvoiceTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceTableService],
    }).compile();

    service = module.get<InvoiceTableService>(InvoiceTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
