import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDirectorDto } from './dto/create-board-director.dto';
import { UpdateBoardDirectorDto } from './dto/update-board-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { BoardDirector } from 'src/router/board-directors/entities/board-director.entity';
import { UserService } from 'src/router/user/user.service';
import { ConfigService } from '@nestjs/config';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';

@Injectable()
export class BoardDirectorsService {
  constructor(
    @InjectRepository(BoardDirector)
    private boardDirectorRepository: Repository<BoardDirector>,
    private userservice: UserService,
    private readonly configService: ConfigService,
  ) {}
  async create(createBoardDirectorDto: CreateBoardDirectorDto) {
    // Find the user and verify that exists
    const user = await this.userservice.findOneById(
      createBoardDirectorDto.userId,
    );
    const existDirector = await this.findDirectorById(
      createBoardDirectorDto.userId,
    );
    if (existDirector) {
      throw new NotFoundException(
        `Director con id: ${createBoardDirectorDto.userId} ya esta registrado`,
      );
    }
    console.log('🚀 ~ BoardDirectorsService :', existDirector);
    // Create a new Director
    const newDirector = await this.boardDirectorRepository.create(
      createBoardDirectorDto,
    );
    // Add foreign key form user table
    newDirector.user = user;
    return await this.boardDirectorRepository.save(newDirector);
    // return newDirector;
  }

  async findAll(pagination: PaginationDto, statusR: StatusQueryDto) {
    const { limit, offset } = pagination;
    const { status } = statusR;
    const [directors, total] = await this.boardDirectorRepository.findAndCount({
      where: { status },
      relations: { user: true },
      select: {
        _id: true,
        startDate: true,
        endDate: true,
        positionRole: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // user: {
        //   _id: true,
        //   name: true,
        //   surname: true,
        //   email: true,
        //   phoneNumber: true,
        //   ci: true,
        //   profileImg: true,
        // },
      },
      take: limit,
      skip: offset,
    });
    // Concatenate the base URL to profileImg
    directors.forEach((director) => {
      director.user.profileImg =
        this.configService.get('HOST_ADMIN') +
        'profileImgs/' +
        director.user.profileImg;
    });
    return { limit, offset, total, directors };
  }

  async findOneById(id: string): Promise<BoardDirector> {
    const director = await this.boardDirectorRepository.findOne({
      where: { _id: id },
      select: {
        _id: true,
        startDate: true,
        endDate: true,
        positionRole: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          _id: true,
          name: true,
          surname: true,
          email: true,
          phoneNumber: true,
          ci: true,
          profileImg: true,
        },
      },
    });
    if (!director) throw new NotFoundException(`Usuario no encontrado`);
    director.user.profileImg =
      this.configService.get('HOST_ADMIN') +
      'profileImgs/' +
      director.user.profileImg;
    return director;
  }

  async findOneByUserId(userId: string): Promise<BoardDirector> {
    const director = await this.boardDirectorRepository.findOne({
      where: { user: { _id: userId } },
      relations: {
        user: true,
      },
      select: {
        _id: true,
        startDate: true,
        endDate: true,
        positionRole: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          _id: true,
          name: true,
          surname: true,
          email: true,
          phoneNumber: true,
          ci: true,
          profileImg: true,
        },
      },
    });
    if (!director) throw new NotFoundException(`Usuario no encontrado`);
    director.user.profileImg =
      this.configService.get('HOST_ADMIN') +
      'profileImgs/' +
      director.user.profileImg;
    return director;
  }

  update(id: number, updateBoardDirectorDto: UpdateBoardDirectorDto) {
    return `This action updates a #${id} boardDirector`;
  }

  remove(id: number) {
    return `This action removes a #${id} boardDirector`;
  }

  // ===============  FIND DIRECTOR BY ID ===============
  async findDirectorById(id: string): Promise<BoardDirector | null> {
    const director = await this.boardDirectorRepository.findOneBy({ _id: id });
    return director;
  }
}
