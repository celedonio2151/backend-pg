import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardDirector } from 'src/router/board-directors/entities/board-director.entity';
import { UserService } from 'src/router/user/user.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';
import { Repository } from 'typeorm';
import { CreateBoardDirectorDto } from './dto/create-board-director.dto';
import { UpdateBoardDirectorDto } from './dto/update-board-director.dto';

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
    const newDirector = this.boardDirectorRepository.create(
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

    const queryBuilder = this.boardDirectorRepository
      .createQueryBuilder('board_director')
      .leftJoinAndSelect('board_director.user', 'user')
      .select([
        'board_director._id',
        'board_director.startDate',
        'board_director.endDate',
        'board_director.positionRole',
        'board_director.description',
        'board_director.order',
        'board_director.createdAt',
        'board_director.updatedAt',
        'board_director.status',
        'user._id',
        'user.name',
        'user.surname',
        'user.phoneNumber',
        'user.ci',
        'user.profileImg',
      ])
      .where('board_director.deletedAt IS NULL')
      .andWhere('user.deletedAt IS NULL');

    // Aplicar filtro de status condicionalmente
    if (status !== undefined) {
      queryBuilder.andWhere('board_director.status = :status', { status });
    }
    const [directors, total] = await queryBuilder
      .clone()
      .orderBy('board_director.order', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const processedDirectors = directors.map((director) => ({
      ...director,
      user: {
        ...director.user,
        profileImg: director.user.profileImg
          ? `${this.configService.get('HOST_ADMIN')}profileImgs/${director.user.profileImg}`
          : null,
      },
    }));

    return { limit, offset, total, directors: processedDirectors };
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

  async update(id: string, updateBoardDirectorDto: UpdateBoardDirectorDto) {
    try {
      // Verificar que el director existe y no está eliminado
      const existingDirector = await this.boardDirectorRepository
        .createQueryBuilder('board_director')
        .leftJoin('board_director.user', 'user')
        .select(['board_director._id', 'board_director.user'])
        .where('board_director._id = :id', { id })
        .andWhere('board_director.deletedAt IS NULL')
        .getOne();

      if (!existingDirector) {
        throw new NotFoundException(`BoardDirector with ID ${id} not found`);
      }

      // Realizar la actualización
      const updateResult = await this.boardDirectorRepository
        .createQueryBuilder()
        .update()
        .set({
          ...updateBoardDirectorDto,
          updatedAt: new Date(),
        })
        .where('_id = :id', { id })
        .andWhere('deletedAt IS NULL')
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException(
          `Failed to update BoardDirector with ID ${id}`,
        );
      }

      // Retornar el registro actualizado
      return await this.findOneById(id);
    } catch (error) {
      console.error('Error updating BoardDirector:', error);
      throw error;
    }
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
