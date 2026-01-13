import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly transporter;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, text: string, html?: string, attachments?: Array<{
        filename: string;
        content: Buffer;
        cid?: string;
    }>): Promise<any>;
}
