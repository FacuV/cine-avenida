import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SeatStatus } from '../common/enums';

type SeatUpdate = { id: string; status: SeatStatus };

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? '*',
  },
})
export class SeatUpdatesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinShowing')
  handleJoinShowing(client: Socket, payload: { showingId?: string }) {
    if (!payload?.showingId) {
      return;
    }
    client.join(this.roomName(payload.showingId));
  }

  notifySeats(showingId: string, seats: SeatUpdate[]) {
    if (!seats.length) {
      return;
    }
    this.server.to(this.roomName(showingId)).emit('seats:update', {
      showingId,
      seats,
    });
  }

  private roomName(showingId: string) {
    return `showing:${showingId}`;
  }
}
