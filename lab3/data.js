// Тимчасове сховище в оперативній пам'яті: дані зникають після перезапуску сервера.
// Структура відповідає колекціям users і waybills з ER-діаграми PostProject.

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
