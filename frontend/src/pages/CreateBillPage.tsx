import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { FileText, User, ChevronDown, Loader2, Calculator, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllCustomers, useCreateServiceRecord } from '../hooks/useQueries';
import { calculateBilling, formatCurrency } from '../utils/billingCalculations';
import { ServiceRecord } from '../backend';
import { toast } from 'sonner';

interface BillForm {
  customerId: string;
  oilChange: boolean;
  generalService: boolean;
  engineRepair: boolean;
  spareParts: boolean;
  customService: string;
  labourCharges: string;
  sparePartsCost: string;
  discount: string;
  gstEnabled: boolean;
}

const defaultForm: BillForm = {
  customerId: '',
  oilChange: false,
  generalService: false,
  engineRepair: false,
  spareParts: false,
  customService: '',
  labourCharges: '',
  sparePartsCost: '',
  discount: '',
  gstEnabled: false,
};

export default function CreateBillPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { customerId?: string };
  const preselectedCustomerId = params.customerId;

  const [form, setForm] = useState<BillForm>({
    ...defaultForm,
    customerId: preselectedCustomerId ?? '',
  });

  const { data: customers, isLoading: customersLoading } = useGetAllCustomers();
  const { mutateAsync: createServiceRecord, isPending } = useCreateServiceRecord();

  const now = new Date();
  const invoiceDate = now.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const billing = calculateBilling({
    oilChange: form.oilChange,
    generalService: form.generalService,
    engineRepair: form.engineRepair,
    spareParts: form.spareParts,
    customService: form.customService,
    labourCharges: parseFloat(form.labourCharges) || 0,
    sparePartsCost: parseFloat(form.sparePartsCost) || 0,
    discount: parseFloat(form.discount) || 0,
    gstEnabled: form.gstEnabled,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) {
      toast.error('Please select a customer.');
      return;
    }
    const hasService = form.oilChange || form.generalService || form.engineRepair || form.spareParts || form.customService.trim();
    if (!hasService) {
      toast.error('Please select at least one service.');
      return;
    }

    try {
      const record: ServiceRecord = {
        customerId: BigInt(form.customerId),
        concierge: '',
        serviceType: {
          oilChange: form.oilChange,
          generalService: form.generalService,
          engineRepair: form.engineRepair,
          spareParts: form.spareParts,
        },
        customService: form.customService,
        labourCharges: BigInt(Math.round(parseFloat(form.labourCharges) || 0)),
        sparePartsCost: BigInt(Math.round(parseFloat(form.sparePartsCost) || 0)),
        subtotal: BigInt(billing.subtotal),
        discount: BigInt(billing.discount),
        gstFlag: form.gstEnabled,
        gstAmount: BigInt(billing.gstAmount),
        total: BigInt(billing.total),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };

      const invoiceId = await createServiceRecord({
        customerId: BigInt(form.customerId),
        record,
      });

      toast.success(`Invoice ${invoiceId} created!`);
      navigate({ to: `/invoice/${invoiceId}` });
    } catch (err) {
      toast.error('Failed to create invoice. Please try again.');
    }
  };

  const selectedCustomer = customers?.find(([id]) => id.toString() === form.customerId);

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-amber/10 border border-amber/30">
          <FileText className="h-5 w-5 text-amber" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Create New Bill</h1>
          <p className="text-xs text-muted-foreground">{invoiceDate}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Selection */}
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 space-y-3">
          <h2 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4" /> Customer
          </h2>
          {customersLoading ? (
            <Skeleton className="h-11 bg-secondary" />
          ) : (
            <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
              <SelectTrigger className="bg-input border-garage-border h-11 text-base">
                <SelectValue placeholder="Select a customer..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-garage-border">
                {(customers ?? []).map(([id, profile]) => (
                  <SelectItem key={id.toString()} value={id.toString()} className="py-2">
                    <span className="font-medium">{profile.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">· {profile.bikeNumber} · {profile.bikeModel}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedCustomer && (
            <div className="text-xs text-muted-foreground bg-secondary rounded p-2 flex gap-4">
              <span>📞 {selectedCustomer[1].phone}</span>
              <span>🏍️ {selectedCustomer[1].bikeModel}</span>
              <span>📍 {selectedCustomer[1].kmReading.toString()} km</span>
            </div>
          )}
        </div>

        {/* Services Checklist */}
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 space-y-3">
          <h2 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'oilChange', label: 'Oil Change', price: 300 },
              { key: 'generalService', label: 'General Service', price: 500 },
              { key: 'engineRepair', label: 'Engine Repair', price: 1200 },
              { key: 'spareParts', label: 'Spare Parts', price: 0 },
            ].map(({ key, label, price }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors touch-target ${
                  form[key as keyof BillForm]
                    ? 'border-amber/60 bg-amber/10'
                    : 'border-garage-border bg-secondary hover:border-amber/30'
                }`}
              >
                <Checkbox
                  checked={!!form[key as keyof BillForm]}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, [key]: !!checked }))}
                  className="border-garage-border data-[state=checked]:bg-amber data-[state=checked]:border-amber"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  {price > 0 && <div className="text-xs text-muted-foreground">{formatCurrency(price)}</div>}
                </div>
              </label>
            ))}
          </div>

          {/* Custom Service */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Custom Service (optional)</Label>
            <Input
              value={form.customService}
              onChange={(e) => setForm((f) => ({ ...f, customService: e.target.value }))}
              placeholder="e.g. Chain lubrication, Brake adjustment..."
              className="bg-input border-garage-border h-11 text-base"
            />
          </div>
        </div>

        {/* Cost Fields */}
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 space-y-3">
          <h2 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Charges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Spare Parts Cost (₹)</Label>
              <Input
                value={form.sparePartsCost}
                onChange={(e) => setForm((f) => ({ ...f, sparePartsCost: e.target.value.replace(/[^0-9.]/g, '') }))}
                placeholder="0"
                type="text"
                inputMode="decimal"
                className="bg-input border-garage-border h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Labour Charges (₹)</Label>
              <Input
                value={form.labourCharges}
                onChange={(e) => setForm((f) => ({ ...f, labourCharges: e.target.value.replace(/[^0-9.]/g, '') }))}
                placeholder="0"
                type="text"
                inputMode="decimal"
                className="bg-input border-garage-border h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Discount (₹)</Label>
              <Input
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value.replace(/[^0-9.]/g, '') }))}
                placeholder="0"
                type="text"
                inputMode="decimal"
                className="bg-input border-garage-border h-11 text-base"
              />
            </div>
          </div>

          {/* GST Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded border border-garage-border">
            <div>
              <div className="text-sm font-medium text-foreground">Apply GST (18%)</div>
              <div className="text-xs text-muted-foreground">Goods & Services Tax</div>
            </div>
            <Switch
              checked={form.gstEnabled}
              onCheckedChange={(v) => setForm((f) => ({ ...f, gstEnabled: v }))}
              className="data-[state=checked]:bg-amber"
            />
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-garage-card border border-amber/30 rounded-lg p-4 space-y-2">
          <h2 className="font-heading text-sm font-bold text-amber uppercase tracking-wider flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Bill Summary
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Service Subtotal</span>
              <span>{formatCurrency(billing.subtotal)}</span>
            </div>
            {billing.sparePartsCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Spare Parts</span>
                <span>{formatCurrency(billing.sparePartsCost)}</span>
              </div>
            )}
            {billing.labourCharges > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Labour Charges</span>
                <span>{formatCurrency(billing.labourCharges)}</span>
              </div>
            )}
            {billing.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount</span>
                <span>-{formatCurrency(billing.discount)}</span>
              </div>
            )}
            {form.gstEnabled && (
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span>{formatCurrency(billing.gstAmount)}</span>
              </div>
            )}
            <Separator className="bg-garage-border my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">TOTAL</span>
              <span className="text-amber font-heading text-xl">{formatCurrency(billing.total)}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-amber text-primary-foreground font-heading font-bold text-lg hover:bg-amber-light transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Generating Invoice...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Generate Invoice
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
