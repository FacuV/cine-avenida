import { CreditsService } from './credits.service';
export declare class CreditsController {
    private creditsService;
    constructor(creditsService: CreditsService);
    balance(req: {
        user?: {
            sub: number;
        };
    }): Promise<{
        balanceCents: number;
    }>;
}
