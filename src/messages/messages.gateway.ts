import { WebSocketGateway } from '@nestjs/websockets';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}
}
