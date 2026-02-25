import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, History, FileText, ChevronDown, ChevronUp, Bike, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetServiceHistoryByBikeNumber, useGetAllCustomers } from '../hooks/useQueries';
import { formatCurrency, formatDate, getServiceNames } from '../utils/billingCalculations';

export default function ServiceHistoryPage() {
  const navigate = useNavigate();
  const [bikeNumber, setBikeNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: history, isLoading, isFetched } = useGetServiceHistoryByBikeNumber(searchQuery);
  const { data: customers } = useGetAllCustomers();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(bikeNumber.trim().toUpperCase());
    setExpandedId(null);
  };

  const getCustomerForInvoice = (customerId: bigint) => {
    return customers?.find(([id]) => id === customerId)?.[1] ?? null;
  };

  const sortedHistory = history
    ? [...history].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-amber/10 border border-amber/30">
          <History className="h-5 w-5 text-amber" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Service History</h1>
          <p className="text-xs text-muted-foreground">Search by bike registration number</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={bikeNumber}
            onChange={(e) => setBikeNumber(e.target.value.toUpperCase())}
            placeholder="Enter Bike Number (e.g. TN01AB1234)"
            className="pl-9 bg-input border-garage-border h-12 text-base font-mono tracking-wider uppercase"
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-5 bg-amber text-primary-foreground font-semibold hover:bg-amber-light"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-garage-card rounded-lg" />
          ))}
        </div>
      ) : searchQuery && isFetched ? (
        sortedHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bike className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No records found</p>
            <p className="text-sm mt-1">
              No service history for bike number{' '}
              <span className="font-mono text-amber">{searchQuery}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found{' '}
              <span className="text-amber font-semibold">{sortedHistory.length}</span>{' '}
              record{sortedHistory.length !== 1 ? 's' : ''} for{' '}
              <span className="font-mono text-amber">{searchQuery}</span>
            </p>

            {sortedHistory.map((inv) => {
              const customer = getCustomerForInvoice(inv.customerId);
              const services = getServiceNames(inv.serviceRecord.serviceType);
              if (inv.serviceRecord.customService) services.push(inv.serviceRecord.customService);
              const isExpanded = expandedId === inv.id;
              const isPaid = inv.status === 'paid';

              return (
                <div
                  key={inv.id}
                  className="bg-garage-card border border-garage-border rounded-lg overflow-hidden hover:border-amber/30 transition-colors"
                >
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-amber font-mono text-sm">
                          {inv.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            isPaid
                              ? 'text-xs border-green-500/40 text-green-400'
                              : 'text-xs border-amber/40 text-amber'
                          }
                        >
                          {inv.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(inv.createdAt)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {services.length > 0 ? services.join(', ') : 'No services'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="font-heading font-bold text-amber">
                        {formatCurrency(inv.serviceRecord.total)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-garage-border px-4 pb-4 pt-3 space-y-3">
                      {/* Customer Info */}
                      {customer && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Customer</div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Phone</div>
                            <div className="font-medium text-foreground">{customer.phone}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Bike Model</div>
                            <div className="font-medium text-foreground">{customer.bikeModel}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">KM Reading</div>
                            <div className="font-medium text-foreground">
                              {customer.kmReading.toString()} km
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator className="bg-garage-border" />

                      {/* Services */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Services
                        </div>
                        <div className="space-y-1">
                          {services.length > 0 ? (
                            services.map((s) => (
                              <div key={s} className="flex items-center gap-2 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber flex-shrink-0" />
                                <span className="text-foreground">{s}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No services</span>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-garage-border" />

                      {/* Bill Breakdown */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{formatCurrency(inv.serviceRecord.subtotal)}</span>
                        </div>
                        {Number(inv.serviceRecord.sparePartsCost) > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Spare Parts</span>
                            <span>{formatCurrency(inv.serviceRecord.sparePartsCost)}</span>
                          </div>
                        )}
                        {Number(inv.serviceRecord.labourCharges) > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Labour</span>
                            <span>{formatCurrency(inv.serviceRecord.labourCharges)}</span>
                          </div>
                        )}
                        {Number(inv.serviceRecord.discount) > 0 && (
                          <div className="flex justify-between text-destructive">
                            <span>Discount</span>
                            <span>-{formatCurrency(inv.serviceRecord.discount)}</span>
                          </div>
                        )}
                        {inv.serviceRecord.gstFlag && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>GST (18%)</span>
                            <span>{formatCurrency(inv.serviceRecord.gstAmount)}</span>
                          </div>
                        )}
                        <Separator className="bg-garage-border" />
                        <div className="flex justify-between font-bold">
                          <span className="text-foreground">Total</span>
                          <span className="text-amber">{formatCurrency(inv.serviceRecord.total)}</span>
                        </div>
                      </div>

                      {/* View Full Invoice */}
                      <button
                        onClick={() =>
                          navigate({
                            to: '/invoice/$invoiceId',
                            params: { invoiceId: inv.id },
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 h-10 rounded border border-amber/40 text-amber text-sm font-medium hover:bg-amber/10 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Full Invoice
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : !searchQuery ? (
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Search Service History</p>
          <p className="text-sm mt-1">Enter a bike registration number above to find past records</p>
        </div>
      ) : null}
    </div>
  );
}
