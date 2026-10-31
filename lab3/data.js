export const users = [];
export const waybills = [];

let userIdCounter = 1;
let waybillIdCounter = 1;

export function getNextUserId() {
  return String(userIdCounter++);
}

export function getNextWaybillId() {
  return String(waybillIdCounter++);
}
