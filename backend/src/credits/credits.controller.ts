import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  balance(@Req() req: { user?: { sub: number } }) {
    return this.creditsService.balance(req.user?.sub ?? 0);
  }
}
