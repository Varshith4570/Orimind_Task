import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_1234567890',
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'razorpay_secret_1234567890',
    });
  }

  async createOrder(userId: string) {
    try {
      const amount = 1700; // $17.00
      const options = {
        amount: amount * 100, 
        currency: 'INR',
        receipt: `rcpt_${userId.substring(0, 8)}_${Date.now().toString().slice(-8)}`,
      };

      const key = this.configService.get<string>('RAZORPAY_KEY_ID');
      let orderId = '';

      if (!key || key === 'rzp_test_1234567890') {
        // Mock order for local development
        orderId = 'order_mock_' + Date.now();
      } else {
        const order = await this.razorpay.orders.create(options);
        orderId = order.id;
      }

      await this.prisma.subscription.create({
        data: {
          userId,
          razorpayOrderId: orderId,
          status: 'CREATED',
        }
      });

      return { id: orderId, amount: options.amount, currency: options.currency };
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      throw new InternalServerErrorException('Error creating Razorpay order');
    }
  }

  async verifyPayment(userId: string, order_id: string, payment_id: string, signature: string) {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'razorpay_secret_1234567890';
    
    // Bypass signature check for local development using mock keys
    if (secret !== 'razorpay_secret_1234567890' || signature !== 'mock_signature') {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(order_id + "|" + payment_id)
        .digest("hex");

      if (generatedSignature !== signature) {
        throw new BadRequestException("Invalid payment signature");
      }
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { razorpayOrderId: order_id }
    });

    if (subscription && subscription.status !== 'ACTIVE') {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE', razorpaySubscriptionId: payment_id }
      });

      // Update User
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { 
            plan: 'PRO',
            totalCredits: { increment: 100 }, 
          }
        }),
        this.prisma.transaction.create({
          data: {
            userId: userId,
            type: 'CREDIT_ADD',
            amount: 100,
          }
        })
      ]);
    }

    return { success: true };
  }

  async verifyWebhook(body: any, signature: string) {
    // Webhook implementation (backup)
    return { status: 'ok' };
  }
}
