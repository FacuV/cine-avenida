"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatUpdatesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let SeatUpdatesGateway = class SeatUpdatesGateway {
    server;
    handleJoinShowing(client, payload) {
        if (!payload?.showingId) {
            return;
        }
        client.join(this.roomName(payload.showingId));
    }
    notifySeats(showingId, seats) {
        if (!seats.length) {
            return;
        }
        this.server.to(this.roomName(showingId)).emit('seats:update', {
            showingId,
            seats,
        });
    }
    roomName(showingId) {
        return `showing:${showingId}`;
    }
};
exports.SeatUpdatesGateway = SeatUpdatesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SeatUpdatesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinShowing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SeatUpdatesGateway.prototype, "handleJoinShowing", null);
exports.SeatUpdatesGateway = SeatUpdatesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_ORIGIN ?? '*',
        },
    })
], SeatUpdatesGateway);
//# sourceMappingURL=seat-updates.gateway.js.map