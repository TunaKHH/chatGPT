import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Configuration, OpenAIApi } from 'openai';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any): Promise<void> {
    const response = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt: payload,
      max_tokens: 150,
      // n: 1,
      temperature: 0.9,
    });

    const message = response.data.choices[0].text.trim();
    this.server.emit('message', message);
  }
}
