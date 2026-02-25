import { Invoice, CustomerProfile } from '../backend';
import { formatCurrency, formatDate, getServiceNames } from './billingCalculations';

function padRight(str: string, len: number): string {
  return str.substring(0, len).padEnd(len, ' ');
}

function padLeft(str: string, len: number): string {
  return str.substring(0, len).padStart(len, ' ');
}

function centerText(str: string, width: number): string {
  const trimmed = str.substring(0, width);
  const totalPad = width - trimmed.length;
  const leftPad = Math.floor(totalPad / 2);
  return ' '.repeat(leftPad) + trimmed + ' '.repeat(totalPad - leftPad);
}

function divider(width: number, char = '-'): string {
  return char.repeat(width);
}

function formatLine(label: string, value: string, width: number): string {
  const maxLabel = width - value.length - 1;
  return padRight(label, maxLabel) + ' ' + value;
}

export function formatReceipt58mm(invoice: Invoice, customer: CustomerProfile | null): string {
  const W = 32;
  const lines: string[] = [];
  const sr = invoice.serviceRecord;

  lines.push(centerText('FUSION GEAR', W));
  lines.push(centerText('Bike Service Center', W));
  lines.push(centerText('Ph: 8073670402', W));
  lines.push(divider(W, '='));
  lines.push(formatLine('Invoice:', invoice.id, W));
  lines.push(formatLine('Date:', formatDate(invoice.createdAt).split(',')[0], W));
  lines.push(divider(W));

  if (customer) {
    lines.push(formatLine('Name:', customer.name.substring(0, 14), W));
    lines.push(formatLine('Phone:', customer.phone, W));
    lines.push(formatLine('Bike:', customer.bikeModel.substring(0, 14), W));
    lines.push(formatLine('Reg No:', customer.bikeNumber, W));
    lines.push(formatLine('KM:', customer.kmReading.toString(), W));
  }

  lines.push(divider(W, '='));
  lines.push(centerText('SERVICES', W));
  lines.push(divider(W));

  const services = getServiceNames(sr.serviceType);
  if (sr.customService) services.push(sr.customService);

  services.forEach((s) => {
    lines.push('  ' + s.substring(0, W - 2));
  });

  lines.push(divider(W));
  lines.push(formatLine('Subtotal:', `Rs.${sr.subtotal}`, W));
  if (sr.sparePartsCost > 0) lines.push(formatLine('Spare Parts:', `Rs.${sr.sparePartsCost}`, W));
  if (sr.labourCharges > 0) lines.push(formatLine('Labour:', `Rs.${sr.labourCharges}`, W));
  if (sr.discount > 0) lines.push(formatLine('Discount:', `-Rs.${sr.discount}`, W));
  if (sr.gstFlag) lines.push(formatLine('GST (18%):', `Rs.${sr.gstAmount}`, W));
  lines.push(divider(W, '='));
  lines.push(formatLine('TOTAL:', `Rs.${sr.total}`, W));
  lines.push(divider(W, '='));
  lines.push(formatLine('Status:', sr.total > 0 ? invoice.status.toUpperCase() : 'PAID', W));
  lines.push(divider(W));
  lines.push(centerText('Thank You!', W));
  lines.push(centerText('Visit Again', W));
  lines.push('');

  return lines.join('\n');
}

export function formatReceipt80mm(invoice: Invoice, customer: CustomerProfile | null): string {
  const W = 48;
  const lines: string[] = [];
  const sr = invoice.serviceRecord;

  lines.push(centerText('FUSION GEAR - BIKE SERVICE CENTER', W));
  lines.push(centerText('Contact: 8073670402', W));
  lines.push(divider(W, '='));
  lines.push(formatLine('Invoice No:', invoice.id, W));
  lines.push(formatLine('Date & Time:', formatDate(invoice.createdAt), W));
  lines.push(divider(W));

  if (customer) {
    lines.push(formatLine('Customer Name:', customer.name, W));
    lines.push(formatLine('Phone:', customer.phone, W));
    lines.push(formatLine('Address:', customer.address.substring(0, 28), W));
    lines.push(formatLine('Bike Model:', customer.bikeModel, W));
    lines.push(formatLine('Reg. Number:', customer.bikeNumber, W));
    lines.push(formatLine('KM Reading:', customer.kmReading.toString() + ' km', W));
    lines.push(formatLine('Fuel Level:', customer.fuelLevel, W));
  }

  lines.push(divider(W, '='));
  lines.push(centerText('SERVICE DETAILS', W));
  lines.push(divider(W));

  const services = getServiceNames(sr.serviceType);
  if (sr.customService) services.push(sr.customService);

  services.forEach((s) => {
    lines.push('  * ' + s.substring(0, W - 4));
  });

  if (services.length === 0) lines.push('  No services recorded');

  lines.push(divider(W));
  lines.push(formatLine('Service Subtotal:', `Rs. ${sr.subtotal}`, W));
  if (sr.sparePartsCost > 0) lines.push(formatLine('Spare Parts Cost:', `Rs. ${sr.sparePartsCost}`, W));
  if (sr.labourCharges > 0) lines.push(formatLine('Labour Charges:', `Rs. ${sr.labourCharges}`, W));
  if (sr.discount > 0) lines.push(formatLine('Discount:', `-Rs. ${sr.discount}`, W));
  if (sr.gstFlag) lines.push(formatLine('GST @ 18%:', `Rs. ${sr.gstAmount}`, W));
  lines.push(divider(W, '='));
  lines.push(formatLine('GRAND TOTAL:', `Rs. ${sr.total}`, W));
  lines.push(divider(W, '='));
  lines.push(formatLine('Payment Status:', invoice.status.toUpperCase(), W));
  lines.push(divider(W));
  lines.push(centerText('Thank you for choosing FUSION GEAR!', W));
  lines.push(centerText('We look forward to serving you again.', W));
  lines.push('');

  return lines.join('\n');
}
