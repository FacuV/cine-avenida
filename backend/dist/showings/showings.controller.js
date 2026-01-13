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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowingsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const enums_1 = require("../common/enums");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const create_showing_dto_1 = require("./dto/create-showing.dto");
const seat_hold_dto_1 = require("./dto/seat-hold.dto");
const update_showing_dto_1 = require("./dto/update-showing.dto");
const showings_service_1 = require("./showings.service");
let ShowingsController = class ShowingsController {
    showingsService;
    constructor(showingsService) {
        this.showingsService = showingsService;
    }
    findAll(date) {
        return this.showingsService.findAll(date);
    }
    findOne(id) {
        return this.showingsService.findOne(id);
    }
    findSeats(id) {
        return this.showingsService.findSeats(id);
    }
    create(dto) {
        return this.showingsService.create(dto);
    }
    holdSeats(id, dto, req) {
        return this.showingsService.holdSeats(id, dto.seatIds, req.user?.sub ?? 0);
    }
    releaseSeats(id, dto, req) {
        return this.showingsService.releaseSeats(id, dto.seatIds, req.user?.sub ?? 0);
    }
    update(id, dto) {
        return this.showingsService.update(id, dto);
    }
    cancel(id) {
        return this.showingsService.cancel(id);
    }
    remove(id) {
        return this.showingsService.remove(id);
    }
};
exports.ShowingsController = ShowingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/seats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "findSeats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.EMPLOYEE, enums_1.Role.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_showing_dto_1.CreateShowingDto]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.CUSTOMER),
    (0, common_1.Post)(':id/hold'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seat_hold_dto_1.SeatHoldDto, Object]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "holdSeats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.CUSTOMER),
    (0, common_1.Post)(':id/release'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seat_hold_dto_1.SeatHoldDto, Object]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "releaseSeats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.EMPLOYEE, enums_1.Role.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_showing_dto_1.UpdateShowingDto]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.EMPLOYEE, enums_1.Role.ADMIN),
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.EMPLOYEE, enums_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShowingsController.prototype, "remove", null);
exports.ShowingsController = ShowingsController = __decorate([
    (0, common_1.Controller)('showings'),
    __metadata("design:paramtypes", [showings_service_1.ShowingsService])
], ShowingsController);
//# sourceMappingURL=showings.controller.js.map