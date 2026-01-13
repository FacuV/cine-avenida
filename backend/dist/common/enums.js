"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowingStatus = exports.PurchaseChannel = exports.BookingStatus = exports.SeatStatus = exports.Format = exports.Role = void 0;
var Role;
(function (Role) {
    Role["CUSTOMER"] = "CUSTOMER";
    Role["EMPLOYEE"] = "EMPLOYEE";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Format;
(function (Format) {
    Format["TWO_D"] = "TWO_D";
    Format["THREE_D"] = "THREE_D";
})(Format || (exports.Format = Format = {}));
var SeatStatus;
(function (SeatStatus) {
    SeatStatus["AVAILABLE"] = "AVAILABLE";
    SeatStatus["HELD"] = "HELD";
    SeatStatus["SOLD_ONLINE"] = "SOLD_ONLINE";
    SeatStatus["SOLD_PHYSICAL"] = "SOLD_PHYSICAL";
})(SeatStatus || (exports.SeatStatus = SeatStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["RESERVED"] = "RESERVED";
    BookingStatus["PAID"] = "PAID";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PurchaseChannel;
(function (PurchaseChannel) {
    PurchaseChannel["ONLINE"] = "ONLINE";
    PurchaseChannel["PHYSICAL"] = "PHYSICAL";
})(PurchaseChannel || (exports.PurchaseChannel = PurchaseChannel = {}));
var ShowingStatus;
(function (ShowingStatus) {
    ShowingStatus["SCHEDULED"] = "SCHEDULED";
    ShowingStatus["CANCELLED"] = "CANCELLED";
})(ShowingStatus || (exports.ShowingStatus = ShowingStatus = {}));
//# sourceMappingURL=enums.js.map