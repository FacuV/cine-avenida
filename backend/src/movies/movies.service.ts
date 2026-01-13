import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMovieDto) {
    return this.prisma.movie.create({ data: dto });
  }

  findAll() {
    return this.prisma.movie.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Pelicula no encontrada');
    }
    return movie;
  }

  async update(id: string, dto: UpdateMovieDto) {
    await this.findOne(id);
    return this.prisma.movie.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const showingsCount = await this.prisma.showing.count({ where: { movieId: id } });
    if (showingsCount > 0) {
      throw new BadRequestException('No se puede eliminar la pelicula: tiene funciones asociadas.');
    }
    return this.prisma.movie.delete({ where: { id } });
  }
}
