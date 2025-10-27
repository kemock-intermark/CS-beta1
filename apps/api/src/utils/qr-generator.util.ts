import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

export class QRGenerator {
  /**
   * Generate QR code for ticket/reservation with signature
   */
  static async generateTicketQR(
    ticketId: string,
    userId: string,
    eventId: string,
    secret: string = process.env.JWT_SECRET || 'default-secret'
  ): Promise<string> {
    // Create payload
    const payload = {
      ticketId,
      userId,
      eventId,
      timestamp: Date.now(),
    };

    // Create signature
    const dataString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');

    // Combine payload and signature
    const qrData = {
      ...payload,
      signature,
    };

    // Generate QR code
    const qrCodeData = JSON.stringify(qrData);
    const qrImage = await QRCode.toDataURL(qrCodeData);

    return qrImage;
  }

  /**
   * Verify QR code signature
   */
  static verifyQRSignature(
    qrData: any,
    secret: string = process.env.JWT_SECRET || 'default-secret'
  ): boolean {
    try {
      const { signature, ...payload } = qrData;
      const dataString = JSON.stringify(payload);
      
      const calculatedSignature = crypto
        .createHmac('sha256', secret)
        .update(dataString)
        .digest('hex');

      return calculatedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse QR code data
   */
  static parseQRCode(qrCodeString: string): any | null {
    try {
      return JSON.parse(qrCodeString);
    } catch {
      return null;
    }
  }

  /**
   * Check if QR code is expired (older than 24 hours for tickets)
   */
  static isQRExpired(qrData: any, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    if (!qrData.timestamp) return true;
    
    const age = Date.now() - qrData.timestamp;
    return age > maxAge;
  }
}
