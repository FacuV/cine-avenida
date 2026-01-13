import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { QrModule } from '../qr/qr.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [EmailModule, QrModule, RealtimeModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
