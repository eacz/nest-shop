import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

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

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    //emit just to the client
    //client.emit('message-from-server', {
    //  fullName: 'Pedro',
    //  message: payload.message,
    //});

    //emit to everyone except client
    //client.broadcast.emit('message-from-server', {
    //  fullName: 'Pedro',
    //  message: payload.message,
    //});

    //emit to everyone (including client)
    this.wss.emit('message-from-server', {
      fullName: 'Pedro',
      message: payload.message,
    });
  }
}
