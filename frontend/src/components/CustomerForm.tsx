import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { CustomerProfile } from '../backend';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CustomerFormProps {
  customer?: { id: bigint; profile: CustomerProfile };
  onClose: () => void;
  onSuccess?: (id: bigint) => void;
}

const FUEL_LEVELS = [
  { value: 'Empty', label: '⬜ Empty', color: 'text-destructive' },
  { value: 'Quarter', label: '🟥 1/4 Tank', color: 'text-orange-400' },
  { value: 'Half', label: '🟧 1/2 Tank', color: 'text-amber' },
  { value: 'Three-Quarter', label: '🟨 3/4 Tank', color: 'text-yellow-400' },
  { value: 'Full', label: '🟩 Full Tank', color: 'text-green-500' },
];

const defaultForm: CustomerProfile = {
  name: '',
  phone: '',
  address: '',
  bikeModel: '',
  bikeNumber: '',
  kmReading: BigInt(0),
  fuelLevel: 'Half',
};

export default function CustomerForm({ customer, onClose, onSuccess }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerProfile>(customer?.profile ?? defaultForm);
  const { mutateAsync: createCustomer, isPending: creating } = useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: updating } = useUpdateCustomer();
  const isPending = creating || updating;

  useEffect(() => {
    if (customer) setForm(customer.profile);
  }, [customer]);

  const handleChange = (field: keyof CustomerProfile, value: string | bigint) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.bikeNumber.trim()) {
      toast.error('Name, Phone, and Bike Number are required.');
      return;
    }
    try {
      if (customer) {
        await updateCustomer({ id: customer.id, profile: form });
        toast.success('Customer updated successfully!');
        onClose();
      } else {
        const id = await createCustomer(form);
        toast.success('Customer created successfully!');
        onSuccess?.(id);
        onClose();
      }
    } catch (err) {
      toast.error('Failed to save customer. Please try again.');
    }
  };

  const fuelIndex = FUEL_LEVELS.findIndex((f) => f.value === form.fuelLevel);
  const fuelPercent = fuelIndex >= 0 ? (fuelIndex / (FUEL_LEVELS.length - 1)) * 100 : 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">Customer Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Full Name"
            className="bg-input border-garage-border h-11 text-base"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">Phone Number *</Label>
          <Input
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="10-digit number"
            type="tel"
            className="bg-input border-garage-border h-11 text-base"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-foreground text-sm font-medium">Address</Label>
          <Input
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Street, City"
            className="bg-input border-garage-border h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">Bike Model</Label>
          <Input
            value={form.bikeModel}
            onChange={(e) => handleChange('bikeModel', e.target.value)}
            placeholder="e.g. Honda Activa 6G"
            className="bg-input border-garage-border h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">Bike Number *</Label>
          <Input
            value={form.bikeNumber}
            onChange={(e) => handleChange('bikeNumber', e.target.value.toUpperCase())}
            placeholder="e.g. TN01AB1234"
            className="bg-input border-garage-border h-11 text-base font-mono tracking-wider"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">KM Reading</Label>
          <Input
            value={form.kmReading.toString()}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              handleChange('kmReading', BigInt(val || '0'));
            }}
            placeholder="e.g. 12500"
            type="text"
            inputMode="numeric"
            className="bg-input border-garage-border h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm font-medium">Fuel Level</Label>
          <Select value={form.fuelLevel} onValueChange={(v) => handleChange('fuelLevel', v)}>
            <SelectTrigger className="bg-input border-garage-border h-11 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-garage-border">
              {FUEL_LEVELS.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-base py-2">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Fuel gauge visual */}
          <div className="mt-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${fuelPercent}%`,
                background: fuelPercent > 60 ? '#22c55e' : fuelPercent > 30 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 border-garage-border text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 h-12 bg-amber text-primary-foreground font-semibold hover:bg-amber-light"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isPending ? 'Saving...' : customer ? 'Update' : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
}
