import { Module } from '@nestjs/common';
import { QrModule } from '../qr/qr.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [QrModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
