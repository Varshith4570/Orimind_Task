import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private store = new Map<string, { value: string, expiresAt: number | null }>();
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    this.logger.log('Redis mocked in-memory store initialized (No local Redis available)');
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.store.set(key, { value, expiresAt });
  }

  async setnx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const exists = await this.get(key);
    if (exists) return false;
    await this.set(key, value, ttlSeconds);
    return true;
  }

  async decrby(key: string, value: number): Promise<number> {
    const current = await this.get(key);
    const newValue = (current ? parseInt(current, 10) : 0) - value;
    const item = this.store.get(key);
    this.store.set(key, { value: newValue.toString(), expiresAt: item?.expiresAt || null });
    return newValue;
  }
}
