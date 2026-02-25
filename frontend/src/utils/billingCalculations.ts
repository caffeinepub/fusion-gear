export interface BillingInput {
  oilChange: boolean;
  generalService: boolean;
  engineRepair: boolean;
  spareParts: boolean;
  customService: string;
  labourCharges: number;
  sparePartsCost: number;
  discount: number;
  gstEnabled: boolean;
}

export interface BillingResult {
  subtotal: number;
  sparePartsCost: number;
  labourCharges: number;
  discount: number;
  gstAmount: number;
  total: number;
}

// Fixed service prices (in INR)
const SERVICE_PRICES: Record<string, number> = {
  oilChange: 300,
  generalService: 500,
  engineRepair: 1200,
  spareParts: 0, // cost entered separately
};

export function calculateBilling(input: BillingInput): BillingResult {
  let subtotal = 0;
  if (input.oilChange) subtotal += SERVICE_PRICES.oilChange;
  if (input.generalService) subtotal += SERVICE_PRICES.generalService;
  if (input.engineRepair) subtotal += SERVICE_PRICES.engineRepair;

  const sparePartsCost = Math.max(0, input.sparePartsCost);
  const labourCharges = Math.max(0, input.labourCharges);
  const discount = Math.max(0, input.discount);

  const preTaxTotal = subtotal + sparePartsCost + labourCharges - discount;
  const gstAmount = input.gstEnabled ? Math.round(preTaxTotal * 0.18) : 0;
  const total = Math.max(0, preTaxTotal + gstAmount);

  return {
    subtotal,
    sparePartsCost,
    labourCharges,
    discount,
    gstAmount,
    total,
  };
}

export function formatCurrency(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getServiceNames(serviceType: {
  oilChange: boolean;
  generalService: boolean;
  engineRepair: boolean;
  spareParts: boolean;
}): string[] {
  const names: string[] = [];
  if (serviceType.oilChange) names.push('Oil Change');
  if (serviceType.generalService) names.push('General Service');
  if (serviceType.engineRepair) names.push('Engine Repair');
  if (serviceType.spareParts) names.push('Spare Parts');
  return names;
}
