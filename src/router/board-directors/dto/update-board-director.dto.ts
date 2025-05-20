import { PartialType } from '@nestjs/swagger';
import { CreateBoardDirectorDto } from './create-board-director.dto';

export class UpdateBoardDirectorDto extends PartialType(CreateBoardDirectorDto) {}
