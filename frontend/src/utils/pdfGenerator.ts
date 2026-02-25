import { Invoice, CustomerProfile } from '../backend';
import { formatCurrency, formatDate, getServiceNames } from './billingCalculations';

export async function generateInvoicePDF(invoice: Invoice, customer: CustomerProfile | null): Promise<void> {
  const sr = invoice.serviceRecord;
  const invoiceDate = formatDate(invoice.createdAt);
  const services = getServiceNames(sr.serviceType);
  if (sr.customService) services.push(sr.customService);

  // Build HTML for print
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice ${invoice.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 24px; }
        .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #ff8c00; padding-bottom: 16px; margin-bottom: 20px; }
        .logo { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; }
        .brand-name { font-size: 28px; font-weight: 900; color: #ff8c00; letter-spacing: 2px; }
        .brand-sub { font-size: 12px; color: #555; margin-top: 2px; }
        .contact { font-size: 13px; color: #333; margin-top: 4px; }
        .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .invoice-meta .block { }
        .invoice-meta .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .invoice-meta .value { font-size: 15px; font-weight: 700; color: #1a1a1a; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .customer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; }
        .field { }
        .field .label { font-size: 11px; color: #888; }
        .field .value { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .services-list { margin-bottom: 20px; }
        .service-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .service-dot { width: 8px; height: 8px; background: #ff8c00; border-radius: 50%; flex-shrink: 0; }
        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        .total-row.divider { border-top: 1px solid #eee; margin-top: 4px; padding-top: 8px; }
        .total-row.grand { border-top: 2px solid #ff8c00; margin-top: 4px; padding-top: 8px; font-size: 16px; font-weight: 900; color: #ff8c00; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: ${invoice.status === 'paid' ? '#dcfce7' : '#fef3c7'}; color: ${invoice.status === 'paid' ? '#166534' : '#92400e'}; }
        .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/assets/generated/fusion-gear-logo.dim_512x512.png" class="logo" alt="FUSION GEAR" onerror="this.style.display='none'" />
        <div>
          <div class="brand-name">⚙️ FUSION GEAR</div>
          <div class="brand-sub">Professional Bike Service Center</div>
          <div class="contact">📞 8073670402</div>
        </div>
      </div>

      <div class="invoice-meta">
        <div class="block">
          <div class="label">Invoice Number</div>
          <div class="value">${invoice.id}</div>
        </div>
        <div class="block" style="text-align:right">
          <div class="label">Date & Time</div>
          <div class="value">${invoiceDate}</div>
        </div>
        <div class="block" style="text-align:right">
          <div class="label">Status</div>
          <div class="value"><span class="status-badge">${invoice.status}</span></div>
        </div>
      </div>

      ${customer ? `
      <div class="section-title">Customer & Vehicle Details</div>
      <div class="customer-grid">
        <div class="field"><div class="label">Customer Name</div><div class="value">${customer.name}</div></div>
        <div class="field"><div class="label">Phone</div><div class="value">${customer.phone}</div></div>
        <div class="field"><div class="label">Address</div><div class="value">${customer.address || '—'}</div></div>
        <div class="field"><div class="label">Bike Model</div><div class="value">${customer.bikeModel || '—'}</div></div>
        <div class="field"><div class="label">Registration No.</div><div class="value">${customer.bikeNumber}</div></div>
        <div class="field"><div class="label">KM Reading</div><div class="value">${customer.kmReading.toString()} km</div></div>
        <div class="field"><div class="label">Fuel Level</div><div class="value">${customer.fuelLevel}</div></div>
      </div>
      ` : ''}

      <div class="section-title">Services Performed</div>
      <div class="services-list">
        ${services.length > 0
          ? services.map(s => `<div class="service-item"><div class="service-dot"></div><span>${s}</span></div>`).join('')
          : '<div class="service-item"><span style="color:#888">No services recorded</span></div>'
        }
      </div>

      <div class="totals">
        <div class="total-row"><span>Service Subtotal</span><span>${formatCurrency(sr.subtotal)}</span></div>
        ${Number(sr.sparePartsCost) > 0 ? `<div class="total-row"><span>Spare Parts</span><span>${formatCurrency(sr.sparePartsCost)}</span></div>` : ''}
        ${Number(sr.labourCharges) > 0 ? `<div class="total-row"><span>Labour Charges</span><span>${formatCurrency(sr.labourCharges)}</span></div>` : ''}
        ${Number(sr.discount) > 0 ? `<div class="total-row" style="color:#ef4444"><span>Discount</span><span>-${formatCurrency(sr.discount)}</span></div>` : ''}
        ${sr.gstFlag ? `<div class="total-row"><span>GST (18%)</span><span>${formatCurrency(sr.gstAmount)}</span></div>` : ''}
        <div class="total-row grand"><span>TOTAL</span><span>${formatCurrency(sr.total)}</span></div>
      </div>

      <div class="footer">
        Thank you for choosing FUSION GEAR! | 📞 8073670402 | Professional Bike Service
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the invoice PDF.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
