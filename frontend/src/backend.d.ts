import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BikeNumber = string;
export type Time = bigint;
export interface ServiceType {
    oilChange: boolean;
    engineRepair: boolean;
    generalService: boolean;
    spareParts: boolean;
}
export interface ServiceRecord {
    sparePartsCost: bigint;
    serviceType: ServiceType;
    total: bigint;
    createdAt: Time;
    gstAmount: bigint;
    labourCharges: bigint;
    concierge: string;
    discount: bigint;
    customService: string;
    gstFlag: boolean;
    customerId: bigint;
    subtotal: bigint;
}
export interface CustomerProfile {
    bikeNumber: BikeNumber;
    name: string;
    kmReading: bigint;
    bikeModel: string;
    address: string;
    phone: string;
    fuelLevel: string;
}
export interface Invoice {
    id: string;
    status: string;
    createdAt: Time;
    serviceRecord: ServiceRecord;
    customerId: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomerProfile(profile: CustomerProfile): Promise<bigint>;
    createServiceRecord(customerId: bigint, record: ServiceRecord): Promise<string>;
    deleteCustomerProfile(id: bigint): Promise<void>;
    getAllCustomerProfiles(): Promise<Array<[bigint, CustomerProfile]>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerProfile(id: bigint): Promise<CustomerProfile>;
    getDailySalesTotal(): Promise<bigint>;
    getInvoice(id: string): Promise<Invoice>;
    getMonthlySalesTotal(): Promise<bigint>;
    getPendingInvoices(): Promise<Array<Invoice>>;
    getServiceFrequency(): Promise<Array<[string, bigint]>>;
    getServiceHistoryByBikeNumber(bikeNumber: string): Promise<Array<Invoice>>;
    getServiceRecord(id: string): Promise<Invoice>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomerProfile(id: bigint, profile: CustomerProfile): Promise<void>;
    updateInvoiceStatus(id: string, status: string): Promise<void>;
    updateServiceRecord(id: string, record: ServiceRecord): Promise<void>;
}
