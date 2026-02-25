import React, { useState } from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { Invoice, CustomerProfile } from '../backend';
import { formatReceipt58mm, formatReceipt80mm } from '../utils/escPosFormatter';
import { toast } from 'sonner';

interface ThermalPrintSectionProps {
  invoice: Invoice;
  customer: CustomerProfile | null;
}

export default function ThermalPrintSection({ invoice, customer }: ThermalPrintSectionProps) {
  const [width, setWidth] = useState<'58mm' | '80mm'>('58mm');
  const [copied, setCopied] = useState(false);

  const receiptText = width === '58mm'
    ? formatReceipt58mm(invoice, customer)
    : formatReceipt80mm(invoice, customer);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      toast.success('Receipt text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy text.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${invoice.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: ${width === '58mm' ? '10px' : '12px'}; margin: 0; padding: 8px; }
            pre { white-space: pre-wrap; word-break: break-all; }
            @media print { @page { margin: 0; size: ${width} auto; } }
          </style>
        </head>
        <body><pre>${receiptText}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-3">
      {/* Width Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Paper Width:</span>
        <div className="flex rounded overflow-hidden border border-garage-border">
          {(['58mm', '80mm'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              className={`px-4 py-2 text-sm font-medium transition-colors touch-target ${
                width === w
                  ? 'bg-amber text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="bg-secondary rounded border border-garage-border p-3 overflow-x-auto">
        <pre className="font-mono text-xs text-foreground whitespace-pre leading-relaxed">
          {receiptText}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded border border-garage-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded bg-amber text-primary-foreground text-sm font-semibold hover:bg-amber-light transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>
    </div>
  );
}
