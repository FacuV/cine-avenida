import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreatePhysicalBookingDto } from './dto/create-physical-booking.dto';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  createBooking(
    @Body() dto: CreateBookingDto,
    @Req() req: { user?: { sub: number } },
  ) {
    return this.bookingsService.createCustomerBooking(dto, req.user?.sub ?? 0);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Post('physical')
  createPhysical(
    @Body() dto: CreatePhysicalBookingDto,
    @Req() req: { user?: { sub: number; role: Role } },
  ) {
    return this.bookingsService.createPhysicalBooking(
      dto,
      req.user?.sub ?? 0,
      req.user?.role ?? Role.CUSTOMER,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  listMine(@Req() req: { user?: { sub: number } }) {
    return this.bookingsService.listCustomerBookings(req.user?.sub ?? 0);
  }
}
