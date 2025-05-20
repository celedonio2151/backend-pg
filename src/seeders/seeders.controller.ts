import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { CreateSeederDto } from './dto/create-seeder.dto';
import { UpdateSeederDto } from './dto/update-seeder.dto';

@Controller('seeders')
export class SeedersController {
  constructor(private readonly seedersService: SeedersService) {}

  @Post()
  create(@Body() createSeederDto: CreateSeederDto) {
    return this.seedersService.create(createSeederDto);
  }

  @Get()
  findAll() {
    return this.seedersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seedersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeederDto: UpdateSeederDto) {
    return this.seedersService.update(+id, updateSeederDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seedersService.remove(+id);
  }
}
