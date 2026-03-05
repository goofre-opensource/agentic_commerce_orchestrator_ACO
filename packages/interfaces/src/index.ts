/**
 * Goofre - Unified Commerce Protocol BYOI (Bring Your Own Integration)
 *
 * perfectly typed abstract classes/interfaces for seamless integration.
 */

export interface IGoofRePlugin {
  readonly id: string;
  readonly version: string;
  initialize?(): Promise<void>;
}

export abstract class IPaymentProvider implements IGoofRePlugin {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract authorize(amount: number, currency: string, source: string): Promise<PaymentResult>;
  abstract capture(transactionId: string): Promise<boolean>;
  abstract refund(transactionId: string, amount?: number): Promise<boolean>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorDetails?: string;
}

export abstract class IMailProvider implements IGoofRePlugin {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract sendTemplate(
    to: string,
    templateId: string,
    data: Record<string, unknown>
  ): Promise<boolean>;
}

export abstract class IInventorySynchronizer implements IGoofRePlugin {
  abstract readonly id: string;
  abstract readonly version: string;
  abstract fetchStock(productId: string, locationId: string): Promise<number>;
  abstract commitReservation(reservationId: string): Promise<boolean>;
}
