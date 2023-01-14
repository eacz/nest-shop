import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesService: MessagesService) {}
  @WebSocketServer() wss: Server;

  handleConnection(client: Socket) {
    this.messagesService.registerClient(client);
    this.wss.emit(
      'clients-updated',
      this.messagesService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messagesService.getConnectedClients(),
    );
  }
}
