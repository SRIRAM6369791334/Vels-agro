export type ProductCategory = 'Cleanse' | 'Treat' | 'Moisturise' | 'Protect' | 'Body';

export interface ProductStock {
  dc?: number;
  lab?: number;
  shop?: number;
  [locationId: string]: number | undefined;
}

export interface BillOfMaterialItem {
  materialId: string;
  per: number;
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
  reorderQty?: number;
  active: boolean;
  photo?: string;
  sku?: string;
  barcode?: string;
  line?: string;
  bom?: BillOfMaterialItem[];
}

export interface Material {
  id: string;
  name: string;
  sku: string;
  code?: string;
  kind?: 'Ingredient' | 'Packaging';
  unit: string;
  supplierId: string;
  cost: number;
  onHand: number;
  reorderAt: number;
  allocated?: number;
  leadDays?: number;
}
