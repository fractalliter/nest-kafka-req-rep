import { Controller, Get, Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {ClientKafka} from '@nestjs/microservices';
import {randomBytes, randomInt} from 'crypto';
import { AppService } from './app.service';

@Controller()
export class AppController implements OnModuleDestroy, OnModuleInit {
  constructor(private readonly appService: AppService, @Inject('any_name_i_want') private readonly client: ClientKafka) {}
 async onModuleDestroy() {
    await this.client.close();
  }
  async onModuleInit() {
    this.client.subscribeToResponseOf("webhook_logs");
    await this.client.connect();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('kafka')
  testKafkaWithResponse(){
    const genWebhookLog = () => ({
  source: randomBytes(8).toString('base64url'),
  event: randomBytes(8).toString('base64url'),
  headers: { test: randomBytes(8).toString('base64url') },
  body: { test: randomBytes(8).toString('base64url') },
  processing_status: "DONE",
  processed_record_type: randomBytes(8).toString('base64url'),
  processed_record_id: randomInt(1000)
});
    return this.client.send('webhook_logs', genWebhookLog())
  }
}
