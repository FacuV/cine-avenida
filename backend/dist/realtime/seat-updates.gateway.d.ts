import { Server, Socket } from 'socket.io';
import { SeatStatus } from '../common/enums';
type SeatUpdate = {
    id: string;
    status: SeatStatus;
};
export declare class SeatUpdatesGateway {
    server: Server;
    handleJoinShowing(client: Socket, payload: {
        showingId?: string;
    }): void;
    notifySeats(showingId: string, seats: SeatUpdate[]): void;
    private roomName;
}
export {};
