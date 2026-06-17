// Wishlist app seed data — individual donation items per house
export type House = 'Stanford' | 'UCSF' | 'Oakland';
export type Category = 'hygiene' | 'food' | 'school' | 'toy' | 'other';

export interface Need {
  id: string;
  name: string;
  house: House;
  quantityNeeded: number;
  quantityFulfilled: number;
  unitCost: number;
  daysOpen: number;
  category: Category;
  linkedPatientId?: string;
  description?: string;
  volunteerBlurb?: string;
}

export interface Patient {
  id: string;
  name: string;
  firstName?: string;
  age: number;
  condition: string;
  house: House;
  story: string;
  daysAtHouse?: number;
  hobby?: string;
}

export interface Commitment {
  id: string;
  needId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  fulfillmentType: 'stripe' | 'amazon' | 'dropoff';
}

export function isUrgent(need: Need): boolean {
  return ['n01', 'n11', 'n12'].includes(need.id);
}

export const houseAddresses: Record<House, string> = {
  Stanford: '520 Sand Hill Road, Palo Alto, CA 94304',
  UCSF: '4444 California Street, San Francisco, CA 94118',
  Oakland: '4551 Martin Luther King Jr Way, Oakland, CA 94609',
};

export const patients: Patient[] = [
  { id: 'p01', name: 'Mia', firstName: 'Mia', age: 4, condition: 'cardiac surgery recovery', house: 'Stanford', story: "Mia's family drove from Fresno and has been at Stanford for three weeks.", daysAtHouse: 21, hobby: 'playing with stuffed animals' },
  { id: 'p02', name: 'Carlos', firstName: 'Carlos', age: 8, condition: 'leukemia treatment', house: 'Stanford', story: "Carlos is in his sixth month of chemotherapy. His mom hasn't left his side.", daysAtHouse: 45, hobby: 'drawing superheroes' },
  { id: 'p03', name: 'Emma', firstName: 'Emma', age: 2, condition: 'bone marrow transplant', house: 'UCSF', story: "Emma's transplant went well. Her family is staying close during recovery.", daysAtHouse: 14, hobby: 'singing songs' },
  { id: 'p04', name: 'Theo', firstName: 'Theo', age: 11, condition: 'spinal surgery', house: 'Oakland', story: "Theo loves art and has been here five weeks. His little sister visits every weekend.", daysAtHouse: 35, hobby: 'painting' },
  { id: 'p05', name: 'Sofia', firstName: 'Sofia', age: 6, condition: 'rare neurological condition', house: 'Stanford', story: "Sofia's parents came from Central America. This is their second extended stay.", daysAtHouse: 28, hobby: 'coloring books' },
];

export const needs: Need[] = [
  // Stanford
  { id: 'n01', name: 'Diapers (Sizes 1–4)', house: 'Stanford', category: 'hygiene', quantityNeeded: 120, quantityFulfilled: 20, unitCost: 22, daysOpen: 18, linkedPatientId: 'p01', description: 'New, sealed packs only. Huggies or Pampers preferred.' },
  { id: 'n02', name: 'Toothbrush & Toothpaste Sets', house: 'Stanford', category: 'hygiene', quantityNeeded: 60, quantityFulfilled: 30, unitCost: 8, daysOpen: 12, description: 'Soft-bristle adult and child sets, new only.' },
  { id: 'n03', name: 'Granola Bar Variety Packs', house: 'Stanford', category: 'food', quantityNeeded: 80, quantityFulfilled: 15, unitCost: 12, daysOpen: 22, linkedPatientId: 'p02', description: 'Nut-free preferred. Individually wrapped.' },
  { id: 'n04', name: 'Back-to-School Backpacks', house: 'Stanford', category: 'school', quantityNeeded: 30, quantityFulfilled: 1, unitCost: 25, daysOpen: 45, linkedPatientId: 'p05', description: 'Ages 5–12. Many children have missed months of school.' },
  { id: 'n05', name: 'Stuffed Animals (New)', house: 'Stanford', category: 'toy', quantityNeeded: 50, quantityFulfilled: 38, unitCost: 15, daysOpen: 9, description: 'No plush with small parts. New only.' },
  { id: 'n06', name: 'Target Gift Cards ($25)', house: 'Stanford', category: 'other', quantityNeeded: 40, quantityFulfilled: 12, unitCost: 25, daysOpen: 30, description: 'Used by families for meals and personal items.' },
  // UCSF
  { id: 'n07', name: 'Shampoo & Conditioner Sets', house: 'UCSF', category: 'hygiene', quantityNeeded: 90, quantityFulfilled: 45, unitCost: 10, daysOpen: 15, linkedPatientId: 'p03', description: 'Fragrance-free preferred. Travel or full size.' },
  { id: 'n08', name: 'Instant Oatmeal Packets', house: 'UCSF', category: 'food', quantityNeeded: 100, quantityFulfilled: 20, unitCost: 7, daysOpen: 11, description: 'Instant, sealed. Gluten-free welcome.' },
  { id: 'n09', name: 'Coloring Books + Crayons', house: 'UCSF', category: 'school', quantityNeeded: 40, quantityFulfilled: 10, unitCost: 14, daysOpen: 19, description: 'Ages 3–10. New, unwrapped crayons only.' },
  { id: 'n10', name: 'Family Board Games', house: 'UCSF', category: 'toy', quantityNeeded: 25, quantityFulfilled: 20, unitCost: 30, daysOpen: 7, description: 'All pieces must be included. No open boxes.' },
  { id: 'n11', name: 'Fragrance-Free Laundry Detergent', house: 'UCSF', category: 'other', quantityNeeded: 50, quantityFulfilled: 5, unitCost: 16, daysOpen: 28, description: 'HE-compatible. Many patients have sensitive skin.' },
  // Oakland
  { id: 'n12', name: 'Baby Wipes (Fragrance-Free)', house: 'Oakland', category: 'hygiene', quantityNeeded: 150, quantityFulfilled: 60, unitCost: 12, daysOpen: 21, description: 'Sealed, unopened packs only.' },
  { id: 'n13', name: 'Mixed Snack Packs', house: 'Oakland', category: 'food', quantityNeeded: 150, quantityFulfilled: 80, unitCost: 8, daysOpen: 14, description: 'Crackers, dried fruit, nut-free bars. Individually sealed.' },
  { id: 'n14', name: 'Art Supply Kits', house: 'Oakland', category: 'school', quantityNeeded: 35, quantityFulfilled: 0, unitCost: 18, daysOpen: 32, linkedPatientId: 'p04', description: 'Watercolors, markers, sketch pads. All new.' },
  { id: 'n15', name: 'New Socks (Kids, All Sizes)', house: 'Oakland', category: 'hygiene', quantityNeeded: 80, quantityFulfilled: 10, unitCost: 9, daysOpen: 26, description: 'New only, tags on. Crew or ankle length.' },
  { id: 'n16', name: 'Puzzle Sets (100–500 pcs)', house: 'Oakland', category: 'toy', quantityNeeded: 20, quantityFulfilled: 4, unitCost: 20, daysOpen: 16, description: 'All pieces present. Age 8 and up.' },
  { id: 'n17', name: 'Grocery Gift Cards ($25)', house: 'Oakland', category: 'other', quantityNeeded: 30, quantityFulfilled: 8, unitCost: 25, daysOpen: 35, description: "Safeway, Trader Joe's, or Whole Foods." },
];
