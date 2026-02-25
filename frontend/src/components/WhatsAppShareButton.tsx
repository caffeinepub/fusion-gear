import React from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { Invoice, CustomerProfile } from '../backend';
import { formatCurrency } from '../utils/billingCalculations';

interface WhatsAppShareButtonProps {
  invoice: Invoice;
  customer: CustomerProfile | null;
}

export default function WhatsAppShareButton({ invoice, customer }: WhatsAppShareButtonProps) {
  const handleShare = () => {
    const phone = customer?.phone?.replace(/\D/g, '') || '';
    const invoiceDate = new Date(Number(invoice.createdAt) / 1_000_000).toLocaleDateString('en-IN');
    const services: string[] = [];
    const st = invoice.serviceRecord.serviceType;
    if (st.oilChange) services.push('Oil Change');
    if (st.generalService) services.push('General Service');
    if (st.engineRepair) services.push('Engine Repair');
    if (st.spareParts) services.push('Spare Parts');
    if (invoice.serviceRecord.customService) services.push(invoice.serviceRecord.customService);

    const message = [
      `🔧 *FUSION GEAR* - Service Invoice`,
      `📞 Contact: 8073670402`,
      ``,
      `Invoice No: *${invoice.id}*`,
      `Date: ${invoiceDate}`,
      `Customer: ${customer?.name || 'N/A'}`,
      `Bike: ${customer?.bikeModel || ''} (${customer?.bikeNumber || ''})`,
      ``,
      `Services: ${services.join(', ') || 'N/A'}`,
      ``,
      `*Total Amount: ${formatCurrency(invoice.serviceRecord.total)}*`,
      ``,
      `Thank you for choosing FUSION GEAR! 🏍️`,
      `Please visit us again for your next service.`,
      `📞 8073670402`,
    ].join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full h-12 rounded font-semibold text-white transition-colors touch-target"
      style={{ backgroundColor: '#25D366' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128C7E')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
    >
      <SiWhatsapp className="h-5 w-5" />
      Send via WhatsApp
    </button>
  );
}
