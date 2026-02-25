# Specification

## Summary
**Goal:** Finalize and polish the complete FUSION GEAR motorcycle service management app by fixing all backend logic, wiring all frontend pages to live data, and polishing the UI/UX.

**Planned changes:**
- Fix all backend Motoko actor functions: Customer/Vehicle CRUD, Service record creation, sequential invoice auto-numbering (FG-0001, FG-0002…), billing calculation (Subtotal + Parts + Labour − Discount + optional 18% GST), analytics queries (daily/monthly totals, pending invoices, top services), and Service History search by bike number
- Fix all frontend pages (Dashboard, Customer Profile, Create Bill, Invoice View, Service History) to fully read from and write to the backend with correct React Query wiring and no stale-data issues
- Dashboard shows live daily/monthly sales totals, pending invoices, and top services
- Customer Profile page supports list, create, edit, and delete via backend
- Create Bill page submits a complete service record and navigates to Invoice View on success
- Invoice View renders full invoice data and supports marking invoices as paid with immediate UI update
- Polish visual theme consistently across all pages: dark charcoal/gunmetal background, amber/orange accents, industrial typography, no layout overflow on mobile (375px)
- Fix PDF invoice generator to include FUSION GEAR branding, contact number 8073670402, invoice number, date/time, customer/bike details, itemized services, and full billing breakdown
- Fix WhatsApp Share button to pre-fill customer phone number with a message containing invoice number, total, and a thank-you/reminder note
- Fix Thermal Print section to support 58mm (~32 chars) and 80mm (~48 chars) paper width toggle, correct receipt formatting, and working copy-to-clipboard with confirmation toast

**User-visible outcome:** Every screen in the FUSION GEAR app works end-to-end with live backend data, invoices are correctly numbered and calculated, PDFs and WhatsApp sharing work properly, thermal print receipts render correctly for both paper sizes, and the entire app looks visually consistent on mobile and desktop.
