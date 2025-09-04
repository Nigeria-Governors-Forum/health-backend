import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HumanResourceService } from './human-resource.service';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';

@Controller('human-resource')
export class HumanResourceController {
  constructor(private readonly humanResourceService: HumanResourceService) {}

  @Post()
  create(@Body() createHumanResourceDto: CreateHumanResourceDto) {
    return this.humanResourceService.create(createHumanResourceDto);
  }

  @Get()
  findAll() {
    return this.humanResourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.humanResourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHumanResourceDto: UpdateHumanResourceDto) {
    return this.humanResourceService.update(+id, updateHumanResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.humanResourceService.remove(+id);
  }
}
