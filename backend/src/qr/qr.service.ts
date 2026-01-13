import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async toDataUrl(value: string) {
    return QRCode.toDataURL(value, { width: 240, margin: 1 });
  }

  async toPngBuffer(value: string) {
    return QRCode.toBuffer(value, { width: 300, margin: 1 });
  }
}
