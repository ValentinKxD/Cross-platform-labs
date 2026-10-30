
export const DELIVERY_TYPES = ['standard', 'express'];

const BASE_PRICE = 50;          
const PRICE_PER_KG = 15;        
const PRICE_PER_KM = 2;         
const EXPRESS_SURCHARGE = 150;  
const KM_PER_DAY = 300;         

export function calculateDelivery(weightKg, distanceKm, deliveryType = 'standard') {
  let cost = BASE_PRICE + weightKg * PRICE_PER_KG + distanceKm * PRICE_PER_KM;
  let days = Math.ceil(distanceKm / KM_PER_DAY);

  if (deliveryType === 'express') {
    cost += EXPRESS_SURCHARGE;
    days = Math.max(1, days - 1);
  }

  return { cost: Math.round(cost), days };
}


export function generateTrackingNumber() {
  return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
}
