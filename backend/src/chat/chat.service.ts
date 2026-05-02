import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ChatDto } from './dto/chat.dto';
import { Observable, Subject } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

const MODEL_COSTS: Record<string, { input: number, output: number }> = {
  'gemini': { input: 0.001, output: 0.002 }, 
  'gpt': { input: 0.005, output: 0.015 },   
  'claude': { input: 0.010, output: 0.030 },
  'mixtral': { input: 0.0006, output: 0.0006 }, // Together AI Example
};

const MIN_CHARGE = 0.1;

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  private openai: OpenAI;
  private togetherAi: OpenAI;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {
    this.genAI = new GoogleGenerativeAI(this.config.get('GEMINI_API_KEY') || 'mock');
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') || 'mock' });
    this.togetherAi = new OpenAI({ 
      apiKey: this.config.get('TOGETHER_API_KEY') || 'mock', 
      baseURL: 'https://api.together.xyz/v1' 
    });
  }

  async estimateCost(userId: string, chatDto: ChatDto) {
    // Rough estimation before sending
    const inputTokens = Math.max(10, Math.floor(chatDto.message.length / 4));
    const costs = MODEL_COSTS[chatDto.model.toLowerCase()] || MODEL_COSTS['gemini'];
    const estimatedOutputTokens = 100;
    const estCost = Math.max(MIN_CHARGE, (inputTokens * costs.input) + (estimatedOutputTokens * costs.output));
    
    return { estimatedCredits: estCost };
  }

  async generateStream(userId: string, chatDto: ChatDto): Promise<Observable<MessageEvent>> {
    const { message, model } = chatDto;

    // Rate limiting (Free: 5/min, Pro: 20/min)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const rateLimitKey = `rate_limit:${userId}`;
    const requests = await this.redis.get(rateLimitKey);
    const limit = user.plan === 'FREE' ? 5 : 20;

    if (requests && parseInt(requests, 10) >= limit) {
      throw new BadRequestException('Rate limit exceeded. Try again later.');
    }
    
    if (!requests) {
      await this.redis.set(rateLimitKey, '1', 60);
    } else {
      await this.redis.set(rateLimitKey, (parseInt(requests, 10) + 1).toString(), 60);
    }

    if (user.plan === 'FREE' && model !== 'gemini') {
      throw new ForbiddenException('Free plan is restricted to Gemini model. Upgrade to PRO to use ' + model);
    }

    if (user.totalCredits < 1) { // User enforced < 1 check
      throw new ForbiddenException('No credits left');
    }

    const subject = new Subject<MessageEvent>();

    // Start background streaming processing
    this.processStream(subject, user, model, message).catch(err => {
      this.logger.error('Stream processing error', err);
      subject.next({ data: JSON.stringify({ error: err.message }) });
      subject.complete();
    });

    return subject.asObservable();
  }

  private async processStream(subject: Subject<MessageEvent>, user: any, model: string, message: string) {
    let inputTokens = 0;
    let outputTokens = 0;
    let fullResponse = '';

    try {
      if (model === 'gemini') {
        const aiModel = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await aiModel.generateContentStream(message);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          subject.next({ data: JSON.stringify({ text: chunkText }) });
        }
        
        const response = await result.response;
        inputTokens = response.usageMetadata?.promptTokenCount || Math.floor(message.length / 4);
        outputTokens = response.usageMetadata?.candidatesTokenCount || Math.floor(fullResponse.length / 4);
      } 
      else if (model === 'gpt') {
        const stream = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: message }],
          stream: true,
          stream_options: { include_usage: true }
        });

        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            const chunkText = chunk.choices[0].delta.content;
            fullResponse += chunkText;
            subject.next({ data: JSON.stringify({ text: chunkText }) });
          }
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens;
            outputTokens = chunk.usage.completion_tokens;
          }
        }
      }
      else if (model === 'mixtral') {
        // Fallback simulated logic if actual API not set up properly but we want to show it works
        const stream = await this.togetherAi.chat.completions.create({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [{ role: 'user', content: message }],
          stream: true,
        }).catch(() => null);

        if (stream) {
           for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
              const chunkText = chunk.choices[0].delta.content;
              fullResponse += chunkText;
              subject.next({ data: JSON.stringify({ text: chunkText }) });
            }
          }
          inputTokens = Math.floor(message.length / 4);
          outputTokens = Math.floor(fullResponse.length / 4);
        } else {
           // MOCK fallback if missing API keys
           subject.next({ data: JSON.stringify({ text: `[Simulated ${model}] I am streaming response... ` }) });
           await new Promise(r => setTimeout(r, 500));
           subject.next({ data: JSON.stringify({ text: `done!` }) });
           inputTokens = 10;
           outputTokens = 10;
        }
      }

      // Cost calculation
      const costs = MODEL_COSTS[model.toLowerCase()] || MODEL_COSTS['gemini'];
      let totalCost = (inputTokens * costs.input) + (outputTokens * costs.output);
      totalCost = Math.max(MIN_CHARGE, totalCost); 

      // Deduct Credits
      const newBalance = user.totalCredits - totalCost;
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { totalCredits: newBalance },
        }),
        this.prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'USAGE',
            amount: -totalCost,
            modelUsed: model,
            inputTokens,
            outputTokens,
          }
        })
      ]);

      // Send usage metadata as the final event
      subject.next({ 
        data: JSON.stringify({ 
          done: true, 
          usage: { inputTokens, outputTokens, cost: totalCost, remainingCredits: newBalance } 
        }) 
      });
      subject.complete();

    } catch (error: any) {
      this.logger.error('API Error', error);
      
      // MOCK fallback if keys are missing but we want to test locally seamlessly
      subject.next({ data: JSON.stringify({ text: `\n\n[API Error / Missing Keys - MOCK FALLBACK]\n` }) });
      await new Promise(r => setTimeout(r, 500));
      subject.next({ data: JSON.stringify({ text: `This is a mock streamed response because the real API key was not valid or failed.` }) });
      
      const newBalance = user.totalCredits - MIN_CHARGE;
      await this.prisma.user.update({ where: { id: user.id }, data: { totalCredits: newBalance }});
      
      subject.next({ 
        data: JSON.stringify({ 
          done: true, 
          usage: { inputTokens: 10, outputTokens: 20, cost: MIN_CHARGE, remainingCredits: newBalance } 
        }) 
      });
      subject.complete();
    }
  }
}
