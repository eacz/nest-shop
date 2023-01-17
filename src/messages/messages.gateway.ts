import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { JwtPayload } from 'src/auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}
  @WebSocketServer() wss: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

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
      fullName: this.messagesService.getUserFullNameBySocketId(client.id),
      message: payload.message,
    });
  }
}
