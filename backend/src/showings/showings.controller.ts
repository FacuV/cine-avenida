import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateShowingDto } from './dto/create-showing.dto';
import { SeatHoldDto } from './dto/seat-hold.dto';
import { UpdateShowingDto } from './dto/update-showing.dto';
import { ShowingsService } from './showings.service';

@Controller('showings')
export class ShowingsController {
  constructor(private showingsService: ShowingsService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    return this.showingsService.findAll(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showingsService.findOne(id);
  }

  @Get(':id/seats')
  findSeats(@Param('id') id: string) {
    return this.showingsService.findSeats(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateShowingDto) {
    return this.showingsService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post(':id/hold')
  holdSeats(
    @Param('id') id: string,
    @Body() dto: SeatHoldDto,
    @Req() req: { user?: { sub: number } },
  ) {
    return this.showingsService.holdSeats(id, dto.seatIds, req.user?.sub ?? 0);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post(':id/release')
  releaseSeats(
    @Param('id') id: string,
    @Body() dto: SeatHoldDto,
    @Req() req: { user?: { sub: number } },
  ) {
    return this.showingsService.releaseSeats(id, dto.seatIds, req.user?.sub ?? 0);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShowingDto) {
    return this.showingsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.showingsService.cancel(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showingsService.remove(id);
  }
}
