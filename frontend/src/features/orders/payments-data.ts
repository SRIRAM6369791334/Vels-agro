// Vels Agro Enterprise — Payment Management & Transaction Seed Data
// Section 15: View Transactions, Payment Status, Gateway IDs, Refunds & Bank Reconciliation

export interface PaymentTransaction {
  id: string;
  txnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerType: 'dealer' | 'farmer';
  amount: number;
  paymentMode: 'NEFT/RTGS' | 'UPI' | 'Demand Draft' | 'Dealer 30-Day Credit' | 'Cash';
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  gateway: 'SBI Corporate Banking' | 'Razorpay Agri' | 'HDFC Escrow' | 'ICICI Agri' | 'Direct Cash / Cheque';
  bankRef: string;
  createdAt: number;
  settledAt?: number;
  failureReason?: string;
  isReconciled: boolean;
  notes?: string;
}

export interface RefundRecord {
  id: string;
  refundNumber: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'processed' | 'pending_approval' | 'rejected';
  mode: 'Bank Account Transfer' | 'Dealer Credit Note';
  utrNumber?: string;
  createdAt: number;
  processedAt?: number;
}

const NOW = Date.now();
const DAY_MS = 86400000;
const HOUR_MS = 3600000;

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'txn-101',
    txnNumber: 'TXN-VELS-2026-8819',
    orderId: 'so-agro-1081',
    orderNumber: '#AG-1081',
    customerId: 'dlr-01',
    customerName: 'Kovai Agro Machineries & Implements',
    customerType: 'dealer',
    amount: 1977800,
    paymentMode: 'NEFT/RTGS',
    status: 'successful',
    gateway: 'SBI Corporate Banking',
    bankRef: 'UTR-SBIN2611029104',
    createdAt: NOW - 6 * DAY_MS,
    settledAt: NOW - 6 * DAY_MS + 20 * 60000,
    isReconciled: true,
    notes: 'Full payment for 2 units 55HP Bull Tractors & 7ft Rotavators settled via RTGS.',
  },
  {
    id: 'txn-102',
    txnNumber: 'TXN-VELS-2026-8820',
    orderId: 'so-agro-1082',
    orderNumber: '#AG-1082',
    customerId: 'c-farmer-01',
    customerName: 'Selvakumar Palanisamy (Farmer)',
    customerType: 'farmer',
    amount: 200000,
    paymentMode: 'NEFT/RTGS',
    status: 'successful',
    gateway: 'Razorpay Agri',
    bankRef: 'UTR-IOBA2611034419',
    createdAt: NOW - 3 * DAY_MS,
    settledAt: NOW - 3 * DAY_MS + 10 * 60000,
    isReconciled: true,
    notes: 'Token Advance of ₹2,00,000 for 45HP Tractor. Balance ₹5,82,800 to be disbursed by PACB Loan.',
  },
  {
    id: 'txn-103',
    txnNumber: 'TXN-VELS-2026-8821',
    orderId: 'so-agro-1083',
    orderNumber: '#AG-1083',
    customerId: 'dlr-03',
    customerName: 'Punjab Tractors & Harvest Tech',
    customerType: 'dealer',
    amount: 2484400,
    paymentMode: 'NEFT/RTGS',
    status: 'successful',
    gateway: 'HDFC Escrow',
    bankRef: 'UTR-HDFC2611041019',
    createdAt: NOW - 2 * DAY_MS,
    settledAt: NOW - 2 * DAY_MS + 35 * 60000,
    isReconciled: true,
    notes: 'Commercial Escrow release for 88HP Multi-Crop Combine Harvester dispatch.',
  },
  {
    id: 'txn-104',
    txnNumber: 'TXN-VELS-2026-8822',
    orderId: 'so-agro-1084',
    orderNumber: '#AG-1084',
    customerId: 'c-farmer-02',
    customerName: 'Muthuvelan Ramanathan (Farmer)',
    customerType: 'farmer',
    amount: 50000,
    paymentMode: 'UPI',
    status: 'successful',
    gateway: 'Razorpay Agri',
    bankRef: 'UPI-RAZOR-884102941',
    createdAt: NOW - 1 * DAY_MS,
    settledAt: NOW - 1 * DAY_MS + 2 * 60000,
    isReconciled: true,
    notes: 'Advance booking payment via Google Pay UPI for 5ft Tiller and Boom Sprayer.',
  },
  {
    id: 'txn-105',
    txnNumber: 'TXN-VELS-2026-8823',
    orderId: 'so-agro-1085',
    orderNumber: '#AG-1085',
    customerId: 'c-farmer-03',
    customerName: 'Suresh Gowda (Farmer)',
    customerType: 'farmer',
    amount: 25000,
    paymentMode: 'Demand Draft',
    status: 'pending',
    gateway: 'SBI Corporate Banking',
    bankRef: 'DD-CANARA-990412',
    createdAt: NOW - 8 * HOUR_MS,
    isReconciled: false,
    notes: 'Demand Draft deposited at Shimoga Branch; clearance in progress (T+1 day).',
  },
  {
    id: 'txn-106',
    txnNumber: 'TXN-VELS-2026-8824',
    orderId: 'so-agro-1086',
    orderNumber: '#AG-1086',
    customerId: 'dlr-02',
    customerName: 'Delta Agri Farm Equipments',
    customerType: 'dealer',
    amount: 611500,
    paymentMode: 'Dealer 30-Day Credit',
    status: 'successful',
    gateway: 'Direct Cash / Cheque',
    bankRef: 'CR-VELS-DLR02-OCT',
    createdAt: NOW - 8 * DAY_MS,
    settledAt: NOW - 8 * DAY_MS,
    isReconciled: true,
    notes: 'Dealer Authorized 30-day revolving credit line debit note.',
  },
  {
    id: 'txn-107',
    txnNumber: 'TXN-VELS-2026-8825',
    orderId: 'so-agro-1087',
    orderNumber: '#AG-1087',
    customerId: 'c-farmer-04',
    customerName: 'Balwinder Singh Dhillon (Farmer)',
    customerType: 'farmer',
    amount: 854600,
    paymentMode: 'NEFT/RTGS',
    status: 'successful',
    gateway: 'SBI Corporate Banking',
    bankRef: 'UTR-PUNB2610289192',
    createdAt: NOW - 12 * DAY_MS,
    settledAt: NOW - 12 * DAY_MS + 15 * 60000,
    isReconciled: true,
    notes: 'Full tractor clearance via Punjab National Bank RTGS.',
  },
  {
    id: 'txn-108',
    txnNumber: 'TXN-VELS-2026-8826',
    orderId: 'so-agro-1088',
    orderNumber: '#AG-1088',
    customerId: 'dlr-04',
    customerName: 'Deccan Krishi Yantra Kendra',
    customerType: 'dealer',
    amount: 1090000,
    paymentMode: 'NEFT/RTGS',
    status: 'successful',
    gateway: 'ICICI Agri',
    bankRef: 'UTR-MAHB2611038192',
    createdAt: NOW - 2 * DAY_MS,
    settledAt: NOW - 2 * DAY_MS + 25 * 60000,
    isReconciled: true,
    notes: 'Wholesale batch payment for 2 Compact Orchard Tractors.',
  },
  {
    id: 'txn-109',
    txnNumber: 'TXN-VELS-2026-8827',
    orderId: 'so-agro-1089',
    orderNumber: '#AG-1089',
    customerId: 'c-farmer-05',
    customerName: 'Arumugam Karuppan (Farmer)',
    customerType: 'farmer',
    amount: 50000,
    paymentMode: 'UPI',
    status: 'failed',
    gateway: 'Razorpay Agri',
    bankRef: 'UPI-FAIL-901844',
    createdAt: NOW - 4 * DAY_MS,
    failureReason: 'Bank Server Timeout / Daily UPI Transaction Limit Exceeded on Payer Bank',
    isReconciled: false,
    notes: 'Farmer attempted UPI token booking; bank debit timed out and was reversed.',
  },
  {
    id: 'txn-110',
    txnNumber: 'TXN-VELS-2026-8828',
    orderId: 'so-agro-1090',
    orderNumber: '#AG-1090',
    customerId: 'dlr-01',
    customerName: 'Kovai Agro Machineries & Implements',
    customerType: 'dealer',
    amount: 118600,
    paymentMode: 'UPI',
    status: 'successful',
    gateway: 'SBI Corporate Banking',
    bankRef: 'UPI-SBIPAY-7729104',
    createdAt: NOW - 3 * HOUR_MS,
    settledAt: NOW - 3 * HOUR_MS + 5 * 60000,
    isReconciled: true,
    notes: 'Urgent spare parts consignment paid via SBI Merchant UPI QR.',
  },
];

export const INITIAL_REFUNDS: RefundRecord[] = [
  {
    id: 'ref-01',
    refundNumber: 'REF-VELS-2026-0041',
    orderNumber: '#AG-1086',
    customerId: 'dlr-02',
    customerName: 'Delta Agri Farm Equipments',
    amount: 1900,
    reason: 'Warranty Replacement Credit Note for 5 defective rotavator blades (RMA-4420)',
    status: 'processed',
    mode: 'Dealer Credit Note',
    utrNumber: 'CN-VELS-2026-88',
    createdAt: NOW - 2 * DAY_MS,
    processedAt: NOW - 1 * DAY_MS,
  },
  {
    id: 'ref-02',
    refundNumber: 'REF-VELS-2026-0042',
    orderNumber: '#AG-1089',
    customerId: 'c-farmer-05',
    customerName: 'Arumugam Karuppan (Farmer)',
    amount: 10000,
    reason: 'Token deposit refund due to cooperative bank subsidy delay cancellation',
    status: 'pending_approval',
    mode: 'Bank Account Transfer',
    createdAt: NOW - 2 * DAY_MS,
  },
];
