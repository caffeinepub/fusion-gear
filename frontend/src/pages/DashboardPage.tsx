import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  TrendingUp, Calendar, AlertCircle, Wrench,
  Plus, Users, FileText, BarChart3, IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetDailySalesTotal,
  useGetMonthlySalesTotal,
  useGetPendingInvoices,
  useGetServiceFrequency,
  useGetAllCustomers,
  useGetAllInvoices,
} from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/billingCalculations';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dailyTotal, isLoading: dailyLoading } = useGetDailySalesTotal();
  const { data: monthlyTotal, isLoading: monthlyLoading } = useGetMonthlySalesTotal();
  const { data: pendingInvoices, isLoading: pendingLoading } = useGetPendingInvoices();
  const { data: serviceFrequency, isLoading: freqLoading } = useGetServiceFrequency();
  const { data: customers } = useGetAllCustomers();
  const { data: allInvoices } = useGetAllInvoices();

  const totalCustomers = customers?.length ?? 0;
  const totalInvoices = allInvoices?.length ?? 0;
  const maxFreq =
    serviceFrequency && serviceFrequency.length > 0 ? Number(serviceFrequency[0][1]) : 1;

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Banner */}
      <div className="relative rounded-lg overflow-hidden h-28">
        <img
          src="/assets/generated/fusion-gear-banner.dim_1200x300.png"
          alt="FUSION GEAR"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/40 flex items-center px-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-amber">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back to FUSION GEAR</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/create-bill"
          className="flex items-center gap-3 p-4 bg-amber text-primary-foreground rounded-lg font-semibold hover:bg-amber-light transition-colors touch-target"
        >
          <Plus className="h-5 w-5" />
          <span>New Bill</span>
        </Link>
        <Link
          to="/customers"
          className="flex items-center gap-3 p-4 bg-secondary text-foreground rounded-lg font-semibold hover:bg-muted transition-colors border border-garage-border touch-target"
        >
          <Users className="h-5 w-5 text-amber" />
          <span>Customers</span>
        </Link>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-garage-card border-garage-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Today
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {dailyLoading ? (
              <Skeleton className="h-8 w-24 bg-secondary" />
            ) : (
              <div className="font-heading text-2xl font-bold text-amber">
                {formatCurrency(dailyTotal ?? BigInt(0))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Daily Sales</p>
          </CardContent>
        </Card>

        <Card className="bg-garage-card border-garage-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {monthlyLoading ? (
              <Skeleton className="h-8 w-24 bg-secondary" />
            ) : (
              <div className="font-heading text-2xl font-bold text-amber">
                {formatCurrency(monthlyTotal ?? BigInt(0))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Monthly Sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-amber/10">
            <Users className="h-5 w-5 text-amber" />
          </div>
          <div>
            <div className="font-heading text-xl font-bold text-foreground">{totalCustomers}</div>
            <div className="text-xs text-muted-foreground">Customers</div>
          </div>
        </div>
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-amber/10">
            <FileText className="h-5 w-5 text-amber" />
          </div>
          <div>
            <div className="font-heading text-xl font-bold text-foreground">{totalInvoices}</div>
            <div className="text-xs text-muted-foreground">Invoices</div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <Card className="bg-garage-card border-garage-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber" />
            Pending Payments
            {pendingInvoices && pendingInvoices.length > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {pendingInvoices.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {pendingLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 bg-secondary" />
              ))}
            </div>
          ) : pendingInvoices && pendingInvoices.length > 0 ? (
            <div className="space-y-2">
              {pendingInvoices.slice(0, 5).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() =>
                    navigate({ to: '/invoice/$invoiceId', params: { invoiceId: inv.id } })
                  }
                  className="w-full flex items-center justify-between p-3 bg-secondary rounded border border-garage-border hover:border-amber/40 transition-colors text-left"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{inv.id}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber">
                      {formatCurrency(inv.serviceRecord.total)}
                    </div>
                    <Badge variant="outline" className="text-xs border-amber/40 text-amber">
                      Pending
                    </Badge>
                  </div>
                </button>
              ))}
              {pendingInvoices.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{pendingInvoices.length - 5} more pending
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending payments 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Common Services */}
      <Card className="bg-garage-card border-garage-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber" />
            Most Common Services
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {freqLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 bg-secondary" />
              ))}
            </div>
          ) : serviceFrequency && serviceFrequency.length > 0 ? (
            <div className="space-y-3">
              {serviceFrequency.map(([name, count], idx) => {
                const pct = maxFreq > 0 ? (Number(count) / maxFreq) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{name}</span>
                      <span className="text-muted-foreground">{count.toString()} jobs</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: idx === 0 ? '#ff8c00' : idx === 1 ? '#ffa500' : '#ffb84d',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No service data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
