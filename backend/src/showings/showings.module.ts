import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { ShowingsController } from './showings.controller';
import { ShowingsService } from './showings.service';

@Module({
  imports: [RealtimeModule],
  controllers: [ShowingsController],
  providers: [ShowingsService],
})
export class ShowingsModule {}
