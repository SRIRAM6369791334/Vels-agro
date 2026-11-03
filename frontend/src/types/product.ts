export type ProductCategory = 'Cleanse' | 'Treat' | 'Moisturise' | 'Protect' | 'Body';

export interface ProductStock {
  dc?: number;
  lab?: number;
  shop?: number;
  [locationId: string]: number | undefined;
}

export interface Product {
  id: string;
  name: string;
  size: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: ProductStock;
  reorderAt: number;
  active: boolean;
  photo?: string;
  sku?: string;
}

export interface Material {
  id: string;
  name: string;
  sku: string;
  unit: string;
  supplierId: string;
  cost: number;
  onHand: number;
  reorderAt: number;
  allocated?: number;
  leadDays?: number;
}
