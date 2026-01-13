import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: Array<{ filename: string; content: Buffer; cid?: string }>,
  ) {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') ?? 'Cine Avenida Bolivar';
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL') ?? this.configService.get<string>('SMTP_USER');

    if (!fromEmail) {
      throw new Error('SMTP_FROM_EMAIL o SMTP_USER no configurado');
    }

    return this.transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
  }
}
