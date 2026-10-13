export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  minThreshold: number; // default 5
  description?: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: 'increment' | 'decrement' | 'bulk' | 'create' | 'edit';
  previousQty: number;
  newQty: number;
  delta: number;
  reason: string;
  timestamp: string;
}

export interface AndroidNotification {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  previousQuantity: number;
  timestamp: string;
  read: boolean;
}

export type SortField = 'name' | 'quantity' | 'price' | 'value' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';
export type FilterStatus = 'all' | 'low_stock' | 'in_stock' | 'out_of_stock';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

