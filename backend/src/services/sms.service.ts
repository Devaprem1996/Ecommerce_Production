import logger from "../logger/index.js";

export interface SendOtpOptions {
  phone: string;
  otp: string;
  purpose?: string;
}

export interface SendOrderSmsOptions {
  phone: string;
  orderNumber: string;
  grandTotal: string | number;
  trackingUrl?: string;
}

export interface SendPaymentSmsOptions {
  phone: string;
  orderNumber: string;
  amount: string | number;
  trackingUrl?: string;
}

export interface SendDeliverySmsOptions {
  phone: string;
  orderNumber: string;
  customerName?: string;
  trackingUrl?: string;
}

export class SmsService {
  /**
   * Send 6-digit OTP to mobile number via Fast2SMS Quick SMS / OTP route
   */
  static async sendOtp(options: SendOtpOptions): Promise<boolean> {
    const { phone, otp, purpose = "Verification" } = options;
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const apiKey = process.env.FAST2SMS_API_KEY;
    const isMock = !apiKey || apiKey.toLowerCase() === "mock" || apiKey.trim() === "";

    if (isMock) {
      logger.info(
        `\n==================================================\n` +
        `[MOCK SMS GATEWAY] Sent to: +91${cleanPhone}\n` +
        `Purpose: ${purpose}\n` +
        `OTP Code: >>> ${otp} <<<\n` +
        `Valid for: 5 minutes\n` +
        `==================================================\n`
      );
      return true;
    }

    try {
      const cleanKey = apiKey.trim();
      logger.info(`[Fast2SMS] Dispatching OTP [${otp}] to +91${cleanPhone} (${purpose})...`);

      // Fast2SMS Quick Route (Active & verified with wallet recharge)
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: cleanKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Your Yathu Arokiyagam verification code is ${otp}. Valid for 5 minutes.`,
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const result: any = await response.json();
      if (result.return === true || result.status_code === 200) {
        logger.info(`[Fast2SMS] Successfully dispatched OTP to +91${cleanPhone}`);
        return true;
      } else {
        logger.warn(
          `[Fast2SMS] Quick route returned message: ${result.message || JSON.stringify(result)}. Attempting OTP route fallback...`
        );

        // Fallback to route 'otp' if needed
        const fallbackRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            authorization: cleanKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "otp",
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });

        const fallbackResult: any = await fallbackRes.json();
        if (fallbackResult.return === true || fallbackResult.status_code === 200) {
          logger.info(`[Fast2SMS OTP Route] Successfully dispatched OTP to +91${cleanPhone}`);
          return true;
        } else {
          logger.error(`[Fast2SMS] Failed to send OTP:`, fallbackResult);
          return false;
        }
      }
    } catch (error) {
      logger.error(`[Fast2SMS] Exception while sending SMS to +91${cleanPhone}:`, error);
      return false;
    }
  }

  /**
   * Helper to dispatch Quick SMS via Fast2SMS with mock fallback
   */
  private static async dispatchQuickSms(
    phone: string,
    message: string,
    label = "SMS"
  ): Promise<boolean> {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY;
    const isMock = !apiKey || apiKey.toLowerCase() === "mock" || apiKey.trim() === "";

    if (isMock) {
      logger.info(
        `\n==================================================\n` +
        `[MOCK SMS GATEWAY] ${label.toUpperCase()}\n` +
        `Sent to: +91${cleanPhone}\n` +
        `Message: ${message}\n` +
        `==================================================\n`
      );
      return true;
    }

    try {
      const cleanKey = apiKey.trim();
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: cleanKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message,
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const result: any = await response.json();
      if (result.return === true || result.status_code === 200) {
        logger.info(`[Fast2SMS] Dispatched ${label} to +91${cleanPhone}`);
        return true;
      } else {
        logger.warn(`[Fast2SMS] Failed to send ${label}:`, result);
        return false;
      }
    } catch (error) {
      logger.error(`[Fast2SMS] Exception while sending ${label} to +91${cleanPhone}:`, error);
      return false;
    }
  }

  /**
   * Send Order Received SMS
   */
  static async sendOrderReceived(options: SendOrderSmsOptions): Promise<boolean> {
    const { phone, orderNumber, grandTotal, trackingUrl } = options;
    const frontendUrl = process.env.FRONTEND_URL || "https://yathuarokiyagam.com";
    const trackLink = trackingUrl || `${frontendUrl}/track-order`;
    const message = `Dear Customer, your order #${orderNumber} for Rs.${grandTotal} has been received at Yathu Arokiyagam! We are preparing your order. Track: ${trackLink}`;
    return this.dispatchQuickSms(phone, message, "Order Received SMS");
  }

  /**
   * Send Payment Confirmed SMS
   */
  static async sendPaymentConfirmed(options: SendPaymentSmsOptions): Promise<boolean> {
    const { phone, orderNumber, amount, trackingUrl } = options;
    const frontendUrl = process.env.FRONTEND_URL || "https://yathuarokiyagam.com";
    const trackLink = trackingUrl || `${frontendUrl}/track-order`;
    const message = `Dear Customer, payment of Rs.${amount} for order #${orderNumber} is confirmed! Thank you for ordering from Yathu Arokiyagam. Track: ${trackLink}`;
    return this.dispatchQuickSms(phone, message, "Payment Confirmed SMS");
  }

  /**
   * Send Order Delivered SMS
   */
  static async sendOrderDelivered(options: SendDeliverySmsOptions): Promise<boolean> {
    const { phone, orderNumber } = options;
    const message = `Dear Customer, your order #${orderNumber} has been delivered successfully! Thank you for shopping with Yathu Arokiyagam. Enjoy your natural wellness products!`;
    return this.dispatchQuickSms(phone, message, "Order Delivered SMS");
  }

  /**
   * Backward compatibility
   */
  static async sendOrderConfirmation(options: SendOrderSmsOptions): Promise<boolean> {
    return this.sendOrderReceived(options);
  }
}
