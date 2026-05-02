import { Controller, Post, Body, UseGuards, Request, Sse, MessageEvent, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Observable } from 'rxjs';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('estimate')
  estimateCost(@Request() req: any, @Body() chatDto: ChatDto) {
    return this.chatService.estimateCost(req.user.userId, chatDto);
  }

  // SSE expects a GET request in browsers natively (EventSource), or we can use custom fetch for POST SSE.
  // Using POST with custom fetch in frontend is better for sending large prompts.
  @UseGuards(JwtAuthGuard)
  @Post('stream')
  @Sse()
  generateStream(@Request() req: any, @Body() chatDto: ChatDto): Promise<Observable<any>> {
    return this.chatService.generateStream(req.user.userId, chatDto);
  }
}
