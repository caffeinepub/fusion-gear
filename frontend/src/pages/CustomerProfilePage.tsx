import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Plus, User, Bike, Phone, Edit2, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerForm from '../components/CustomerForm';
import { useGetAllCustomers, useDeleteCustomer } from '../hooks/useQueries';
import { CustomerProfile } from '../backend';
import { toast } from 'sonner';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<{ id: bigint; profile: CustomerProfile } | null>(
    null
  );
  const { data: customers, isLoading } = useGetAllCustomers();
  const { mutateAsync: deleteCustomer, isPending: deleting } = useDeleteCustomer();

  const filtered = (customers ?? []).filter(([, profile]) => {
    const q = search.toLowerCase();
    return (
      profile.name.toLowerCase().includes(q) ||
      profile.bikeNumber.toLowerCase().includes(q) ||
      profile.phone.includes(q) ||
      profile.bikeModel.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: bigint) => {
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted.');
    } catch {
      toast.error('Failed to delete customer.');
    }
  };

  const handleEdit = (id: bigint, profile: CustomerProfile) => {
    setEditCustomer({ id, profile });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditCustomer(null);
  };

  const handleCreateBill = (id: bigint) => {
    navigate({
      to: '/create-bill/$customerId',
      params: { customerId: id.toString() },
    });
  };

  const FUEL_COLORS: Record<string, string> = {
    Empty: 'text-destructive',
    Quarter: 'text-orange-400',
    Half: 'text-amber',
    'Three-Quarter': 'text-yellow-400',
    Full: 'text-green-500',
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Customers</h1>
        <Button
          onClick={() => {
            setEditCustomer(null);
            setShowForm(true);
          }}
          className="bg-amber text-primary-foreground hover:bg-amber-light h-11 px-4 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, bike number, phone..."
          className="pl-9 bg-input border-garage-border h-11 text-base"
        />
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 bg-garage-card rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{search ? 'No customers found' : 'No customers yet'}</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search' : 'Add your first customer'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(([id, profile]) => (
            <div
              key={id.toString()}
              className="bg-garage-card border border-garage-border rounded-lg p-4 hover:border-amber/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground truncate">{profile.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs border-current ${FUEL_COLORS[profile.fuelLevel] || 'text-muted-foreground'}`}
                    >
                      {profile.fuelLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <Phone className="h-3 w-3" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Bike className="h-3 w-3 text-amber" />
                    <span className="font-mono text-xs font-semibold text-amber">
                      {profile.bikeNumber}
                    </span>
                    <span className="text-xs">· {profile.bikeModel}</span>
                    <span className="text-xs">· {profile.kmReading.toString()} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleCreateBill(id)}
                    className="p-2 rounded text-muted-foreground hover:text-amber hover:bg-amber/10 transition-colors touch-target"
                    title="Create Bill"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(id, profile)}
                    className="p-2 rounded text-muted-foreground hover:text-amber hover:bg-amber/10 transition-colors touch-target"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors touch-target">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-garage-card border-garage-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Delete Customer?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This will permanently delete {profile.name}'s profile. This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-garage-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Delete'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}
      >
        <DialogContent className="bg-garage-card border-garage-border max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-foreground">
              {editCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm customer={editCustomer ?? undefined} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
