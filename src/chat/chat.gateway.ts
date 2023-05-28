import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private openai: OpenAIApi;
  private conversation: ChatCompletionRequestMessage[] = [];
  // 系統訊息 ChatCompletionRequestMessage的格式
  private systemDirections: ChatCompletionRequestMessage = {
    role: 'system',
    content: '通常情況下你總是用繁體中文回覆',
  };

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any): Promise<void> {
    this.conversation.push({
      role: 'user',
      content: payload,
    }); // 將新的訊息加入對話紀錄
    this.logger.debug('conversation', this.conversation);
    this.conversation.push(this.systemDirections);
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...this.conversation, this.systemDirections],
      max_tokens: 500,
      temperature: 1,
    });

    const message = response.data.choices[0].message.content.trim();
    this.conversation.push({
      role: 'assistant',
      content: message,
    }); // 將新的訊息加入對話紀錄
    this.server.emit('message', message);
  }
}
