export enum Role {
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

export enum Format {
  TWO_D = 'TWO_D',
  THREE_D = 'THREE_D',
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  SOLD_ONLINE = 'SOLD_ONLINE',
  SOLD_PHYSICAL = 'SOLD_PHYSICAL',
}

export enum BookingStatus {
  RESERVED = 'RESERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PurchaseChannel {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
}

export enum ShowingStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
}
