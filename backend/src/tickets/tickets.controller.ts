import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Response } from 'express';
import { Role } from '../common/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ScanTicketDto } from './dto/scan-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Post('scan')
  scan(@Body() dto: ScanTicketDto) {
    return this.ticketsService.scanTicket(dto.qrToken);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Get(':qrToken/qr')
  async qr(@Param('qrToken') qrToken: string, @Res() res: Response) {
    const png = await this.ticketsService.generateQrPng(qrToken);
    res.type('png').send(png);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EMPLOYEE, Role.ADMIN)
  @Get(':qrToken')
  find(@Param('qrToken') qrToken: string) {
    return this.ticketsService.findByToken(qrToken);
  }
}
