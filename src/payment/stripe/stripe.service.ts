import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  async getCustomer(customerId: string) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to retrieve customer');
    }
  }

  async getConnectedAccount(accountId: string) {
    try {
      const connectedAccount = await this.stripe.accounts.retrieve(accountId);
      return connectedAccount;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to retrieve connected account');
    }
  }
  async getProduct(productId: string) {
    try {
      const product = await this.stripe.products.retrieve(productId, {
        expand: ['default_price'],
      });
      return product;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to retrieve product');
    }
  }
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to retrieve payment intent');
    }
  }
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string> | null,
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        ...(metadata && { metadata }),
      });
      return customer;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to create customer');
    }
  }

  async createConnectedAccount(
    email: string,
    name: string,
    metadata?: Record<string, string> | null,
  ): Promise<Stripe.Account> {
    try {
      const connectedAccount = await this.stripe.accounts.create({
        type: 'standard',
        email,
        business_profile: {
          name,
        },
        ...(metadata && { metadata }),
      });
      return connectedAccount;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to create connected account');
    }
  }

  async createProduct(
    name: string,
    description: string,
    priceInCents: number,
    metadata?: Record<string, string> | null,
  ) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        default_price_data: { currency: 'usd', unit_amount: priceInCents },
        ...(metadata && { metadata }),
      });
      return product;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to create product');
    }
  }

  async createPaymentIntent(
    amountInCents: number,
    paymentMethodId: string,
    customerId: string,
    destinationAccountId: string,
    metadata?: Record<string, string> | null,
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        customer: customerId,
        confirm: true,
        return_url: 'https://example.com/return',
        application_fee_amount: Math.round(amountInCents * 0.1),
        transfer_data: {
          destination: destinationAccountId,
        },
        ...(metadata && { metadata }),
      });
      return paymentIntent;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(error.message);
      throw new Error('Failed to create payment intent');
    }
  }
}
