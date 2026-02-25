import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type BikeNumber = Text;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type ServiceType = {
    oilChange : Bool;
    generalService : Bool;
    engineRepair : Bool;
    spareParts : Bool;
  };

  public type CustomerProfile = {
    name : Text;
    phone : Text;
    address : Text;
    bikeModel : Text;
    bikeNumber : BikeNumber;
    kmReading : Nat;
    fuelLevel : Text;
  };

  public type ServiceRecord = {
    customerId : Nat;
    concierge : Text;
    serviceType : ServiceType;
    customService : Text;
    labourCharges : Nat;
    sparePartsCost : Nat;
    subtotal : Nat;
    discount : Nat;
    gstFlag : Bool;
    gstAmount : Nat;
    total : Nat;
    createdAt : Time.Time;
  };

  public type Invoice = {
    id : Text;
    customerId : Nat;
    serviceRecord : ServiceRecord;
    status : Text;
    createdAt : Time.Time;
  };

  var nextCustomerId = 1;
  var nextInvoiceNumber = 1;

  let customerProfiles = Map.empty<Nat, CustomerProfile>();
  let invoices = Map.empty<Text, Invoice>();

  public shared ({ caller }) func createCustomerProfile(profile : CustomerProfile) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create customer profiles");
    };
    let id = nextCustomerId;
    customerProfiles.add(id, profile);
    nextCustomerId += 1;
    id;
  };

  public query ({ caller }) func getCustomerProfile(id : Nat) : async CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customer profiles");
    };
    switch (customerProfiles.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllCustomerProfiles() : async [(Nat, CustomerProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customer profiles");
    };
    customerProfiles.entries().toArray();
  };

  public shared ({ caller }) func updateCustomerProfile(id : Nat, profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customer profiles");
    };
    if (not customerProfiles.containsKey(id)) {
      Runtime.trap("Customer not found");
    };
    customerProfiles.add(id, profile);
  };

  public shared ({ caller }) func deleteCustomerProfile(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete customer profiles");
    };
    if (not customerProfiles.containsKey(id)) {
      Runtime.trap("Customer not found");
    };
    customerProfiles.remove(id);
  };

  public shared ({ caller }) func createServiceRecord(customerId : Nat, record : ServiceRecord) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create service records");
    };
    if (not customerProfiles.containsKey(customerId)) {
      Runtime.trap("Customer not found");
    };

    let id = "FG-" # natToString(nextInvoiceNumber);
    let invoice : Invoice = {
      id;
      customerId;
      serviceRecord = record;
      status = "pending";
      createdAt = Time.now();
    };

    invoices.add(id, invoice);
    nextInvoiceNumber += 1;
    id;
  };

  func natToString(n : Nat) : Text {
    if (n < 10) {
      "000" # n.toText();
    } else if (n < 100) {
      "00" # n.toText();
    } else if (n < 1000) {
      "0" # n.toText();
    } else {
      n.toText();
    };
  };

  public query ({ caller }) func getServiceRecord(id : Text) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service records");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray();
  };

  public shared ({ caller }) func updateServiceRecord(id : Text, record : ServiceRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update service records");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        let updatedInvoice : Invoice = {
          id = invoice.id;
          customerId = invoice.customerId;
          serviceRecord = record;
          status = invoice.status;
          createdAt = invoice.createdAt;
        };
        invoices.add(id, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func updateInvoiceStatus(id : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update invoice status");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        let updatedInvoice : Invoice = {
          id = invoice.id;
          customerId = invoice.customerId;
          serviceRecord = invoice.serviceRecord;
          status;
          createdAt = invoice.createdAt;
        };
        invoices.add(id, updatedInvoice);
      };
    };
  };

  public query ({ caller }) func getServiceHistoryByBikeNumber(bikeNumber : Text) : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service history");
    };
    let foundCustomerId = customerProfiles.entries().find(
      func(_id, profile) { profile.bikeNumber == bikeNumber }
    );

    switch (foundCustomerId) {
      case (null) { [] };
      case (?(id, _)) {
        let customerInvoices = invoices.values().toArray().filter(
          func(invoice) { invoice.customerId == id }
        );
        customerInvoices;
      };
    };
  };

  public query ({ caller }) func getPendingInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pending invoices");
    };
    invoices.values().toArray().filter(func(invoice) { invoice.status == "pending" });
  };

  public query ({ caller }) func getDailySalesTotal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };
    let now = Time.now();
    let dayNs : Int = 86_400_000_000_000;
    let startOfDay = now - (now % dayNs);
    var total = 0;
    for (invoice in invoices.values()) {
      if (invoice.createdAt >= startOfDay and invoice.createdAt < startOfDay + dayNs) {
        total += invoice.serviceRecord.total;
      };
    };
    total;
  };

  public query ({ caller }) func getMonthlySalesTotal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };
    let now = Time.now();
    let monthNs : Int = 30 * 86_400_000_000_000;
    let startOfMonth = now - (now % monthNs);
    var total = 0;
    for (invoice in invoices.values()) {
      if (invoice.createdAt >= startOfMonth and invoice.createdAt < startOfMonth + monthNs) {
        total += invoice.serviceRecord.total;
      };
    };
    total;
  };

  public query ({ caller }) func getServiceFrequency() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };
    var oilChange = 0;
    var generalService = 0;
    var engineRepair = 0;
    var sparePartsCount = 0;

    for (invoice in invoices.values()) {
      let st = invoice.serviceRecord.serviceType;
      if (st.oilChange) { oilChange += 1 };
      if (st.generalService) { generalService += 1 };
      if (st.engineRepair) { engineRepair += 1 };
      if (st.spareParts) { sparePartsCount += 1 };
    };

    let services : [(Text, Nat)] = [
      ("Oil Change", oilChange),
      ("General Service", generalService),
      ("Engine Repair", engineRepair),
      ("Spare Parts", sparePartsCount),
    ];

    services.sort(func(a, b) { Nat.compare(b.1, a.1) });
  };

  public query ({ caller }) func getInvoice(id : Text) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };
  };
};
