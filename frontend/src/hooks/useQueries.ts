import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CustomerProfile, Invoice, ServiceRecord, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, CustomerProfile]>>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomerProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomer(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CustomerProfile | null>({
    queryKey: ['customer', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCustomerProfile(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: CustomerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCustomerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: bigint; profile: CustomerProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomerProfile(id, profile);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id.toString()] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomerProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── Invoices / Service Records ──────────────────────────────────────────────

export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInvoice(id: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice | null>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateServiceRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, record }: { customerId: bigint; record: ServiceRecord }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createServiceRecord(customerId, record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['pendingInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['dailySales'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySales'] });
      queryClient.invalidateQueries({ queryKey: ['serviceFrequency'] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInvoiceStatus(id, status);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['pendingInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['dailySales'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySales'] });
    },
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useGetDailySalesTotal() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['dailySales'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailySalesTotal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMonthlySalesTotal() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['monthlySales'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMonthlySalesTotal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingInvoices() {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['pendingInvoices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetServiceFrequency() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['serviceFrequency'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServiceFrequency();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Service History ─────────────────────────────────────────────────────────

export function useGetServiceHistoryByBikeNumber(bikeNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: ['serviceHistory', bikeNumber],
    queryFn: async () => {
      if (!actor || !bikeNumber.trim()) return [];
      return actor.getServiceHistoryByBikeNumber(bikeNumber.trim());
    },
    enabled: !!actor && !isFetching && bikeNumber.trim().length > 0,
  });
}
