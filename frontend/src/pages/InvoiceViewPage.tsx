import React, { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import {
  FileText, Download, ArrowLeft, CheckCircle, Clock,
  User, Bike, Phone, MapPin, Gauge, Fuel, Loader2, IndianRupee
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppShareButton from '../components/WhatsAppShareButton';
import ThermalPrintSection from '../components/ThermalPrintSection';
import { useGetInvoice, useGetCustomer, useUpdateInvoiceStatus } from '../hooks/useQueries';
import { formatCurrency, formatDate, getServiceNames } from '../utils/billingCalculations';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';

export default function InvoiceViewPage() {
  const { invoiceId } = useParams({ from: '/invoice/$invoiceId' });
  const [showPrint, setShowPrint] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: invoice, isLoading: invoiceLoading } = useGetInvoice(invoiceId ?? null);
  const { data: customer, isLoading: customerLoading } = useGetCustomer(
    invoice ? invoice.customerId : null
  );
  const { mutateAsync: updateStatus, isPending: statusPending } = useUpdateInvoiceStatus();

  const isLoading = invoiceLoading || customerLoading;

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      await updateStatus({ id: invoice.id, status: 'paid' });
      toast.success('Invoice marked as paid!');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setPdfLoading(true);
    try {
      await generateInvoicePDF(invoice, customer ?? null);
    } catch {
      toast.error('Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 bg-garage-card" />
        <Skeleton className="h-32 bg-garage-card rounded-lg" />
        <Skeleton className="h-48 bg-garage-card rounded-lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-4 text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link to="/" className="text-amber text-sm mt-2 inline-block hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const sr = invoice.serviceRecord;
  const services = getServiceNames(sr.serviceType);
  if (sr.customService) services.push(sr.customService);
  const isPaid = invoice.status === 'paid';

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold text-foreground">Invoice {invoice.id}</h1>
          <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
        </div>
        <Badge
          variant={isPaid ? 'default' : 'outline'}
          className={isPaid
            ? 'bg-green-500/20 text-green-400 border-green-500/40'
            : 'border-amber/40 text-amber'
          }
        >
          {isPaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
          {invoice.status.toUpperCase()}
        </Badge>
      </div>

      {/* FUSION GEAR Header Card */}
      <div className="bg-garage-card border border-garage-border rounded-lg p-4 flex items-center gap-3">
        <img
          src="/assets/generated/fusion-gear-logo.dim_512x512.png"
          alt="FUSION GEAR"
          className="h-12 w-12 rounded object-cover"
        />
        <div>
          <div className="font-heading text-lg font-bold text-amber">FUSION GEAR ⚙️</div>
          <div className="text-xs text-muted-foreground">Professional Bike Service Center</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> 8073670402
          </div>
        </div>
      </div>

      {/* Customer Details */}
      {customer && (
        <Card className="bg-garage-card border-garage-border">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="font-heading text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Customer & Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="font-semibold text-foreground">{customer.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="font-semibold text-foreground">{customer.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Bike</div>
              <div className="font-semibold text-foreground">{customer.bikeModel}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Reg. No.</div>
              <div className="font-semibold text-amber font-mono">{customer.bikeNumber}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">KM Reading</div>
              <div className="font-semibold text-foreground">{customer.kmReading.toString()} km</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Fuel Level</div>
              <div className="font-semibold text-foreground">{customer.fuelLevel}</div>
            </div>
            {customer.address && (
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Address</div>
                <div className="font-semibold text-foreground">{customer.address}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services */}
      <Card className="bg-garage-card border-garage-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="font-heading text-sm text-muted-foreground uppercase tracking-wider">
            Services Performed
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {services.length > 0 ? (
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber flex-shrink-0" />
                  <span className="text-foreground">{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Bill Breakdown */}
      <Card className="bg-garage-card border-amber/30">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="font-heading text-sm text-amber uppercase tracking-wider flex items-center gap-2">
            <IndianRupee className="h-4 w-4" /> Bill Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Service Subtotal</span>
            <span>{formatCurrency(sr.subtotal)}</span>
          </div>
          {Number(sr.sparePartsCost) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Spare Parts</span>
              <span>{formatCurrency(sr.sparePartsCost)}</span>
            </div>
          )}
          {Number(sr.labourCharges) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Labour Charges</span>
              <span>{formatCurrency(sr.labourCharges)}</span>
            </div>
          )}
          {Number(sr.discount) > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Discount</span>
              <span>-{formatCurrency(sr.discount)}</span>
            </div>
          )}
          {sr.gstFlag && (
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>{formatCurrency(sr.gstAmount)}</span>
            </div>
          )}
          <Separator className="bg-garage-border" />
          <div className="flex justify-between font-bold">
            <span className="font-heading text-base text-foreground">TOTAL</span>
            <span className="font-heading text-xl text-amber">{formatCurrency(sr.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        {/* Mark as Paid */}
        {!isPaid && (
          <button
            onClick={handleMarkPaid}
            disabled={statusPending}
            className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
          >
            {statusPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Mark as Paid
          </button>
        )}

        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="w-full h-12 bg-secondary border border-garage-border hover:border-amber/40 text-foreground font-semibold rounded flex items-center justify-center gap-2 transition-colors"
        >
          {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-amber" />}
          Download / Print PDF
        </button>

        {/* WhatsApp */}
        <WhatsAppShareButton invoice={invoice} customer={customer ?? null} />

        {/* Thermal Print */}
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 space-y-3">
          <button
            onClick={() => setShowPrint(!showPrint)}
            className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              🖨️ Thermal Printer Receipt
            </span>
            <span className="text-xs">{showPrint ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showPrint && (
            <ThermalPrintSection invoice={invoice} customer={customer ?? null} />
          )}
        </div>
      </div>
    </div>
  );
}
