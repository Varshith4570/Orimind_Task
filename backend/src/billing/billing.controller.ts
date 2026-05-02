import { Controller, Post, UseGuards, Request, Body, Headers, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  createOrder(@Request() req: any) {
    return this.billingService.createOrder(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-payment')
  verifyPayment(@Request() req: any, @Body() body: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestException('Missing payment details');
    }
    return this.billingService.verifyPayment(req.user.userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
  }

  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  handleWebhook(@Body() body: any, @Headers('x-razorpay-signature') signature: string) {
    return this.billingService.verifyWebhook(body, signature);
  }
}
