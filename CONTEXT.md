# Apartment Bill Tracker

The apartment-side context of this repo — rooms, tenants, monthly utility bills, and the money the landlord holds on the tenant's behalf. This glossary pins down terms that recur across bills, tenants, and room transfers.

## Language

### Who lives in a room

**Primary tenant** (`tenant.fullName`):
The sole lessee — the party who signs the lease, pays rent, holds the advance and deposit, and moves out. Every bill, receipt, transfer and move-out keys off exactly one primary tenant per room.
_Avoid_: Main tenant, account holder, renter

**Additional occupant** (`tenant.occupants[]`):
Another person authorized to live in the unit, recorded as `{ name, relationship }`. Named in the lease's Occupancy clause but not a party to it: they do not sign, hold no balance, and are not billed. Distinct from the emergency contact, who does not live there.
_Avoid_: Co-tenant, roommate, secondary tenant

**Occupancy clause**:
Clause 2 of the lease, listing the primary tenant's authorized occupants and barring anyone else without the Lessor's written consent. Rendered by three separate generators (print window, on-screen preview, PDF) that must stay in lockstep — the shared wording lives in `src/utils/occupants.js`.
_Avoid_: Residents clause, occupants section

### Money held on the tenant's behalf

**Advance payment**:
One month's rent collected at move-in that covers the tenant's final month. Refundable at move-out only if unused.
_Avoid_: Prepayment, prepaid rent, last-month rent

**Security deposit**:
One month's rent collected at move-in and held against damages or unpaid dues. Returnable at move-out net of deductions.
_Avoid_: Bond, damage deposit

**Move-in bill**:
A `bill.type: 'moveIn'` document recording the advance payment + security deposit collected when a tenant first moves in, created already paid so the payment can be receipted. Its `tenantId` is snapshotted at save and its id is stored back on `tenant.moveInBillId`. It is a record of the transaction, not a balance — `tenant.advancePayment` / `tenant.securityDeposit` remain the source of truth, so revenue aggregations exclude these bills to avoid counting the same pesos twice.
_Avoid_: Deposit bill, initial bill, onboarding invoice

### Room transfer

**Room transfer**:
An active tenant changing rooms within the same building without moving out. Distinct from a move-out followed by a new move-in.
_Avoid_: Room change, room reassignment, room move

**Reconciled amount**:
The target advance and deposit values at the new room, computed 1:1 against the new room's rent. What the tenant *should* be holding after the transfer.
_Avoid_: Recomputed amount, adjusted amount

**Transfer top-up**:
A signed amount collected on a room transfer to bring the tenant's held advance and deposit into proportion with the new room's rent. Positive means the tenant owes; negative means the tenant is owed a refund.
_Avoid_: Top-up, adjustment, delta, difference

**Transfer bill**:
A `bill.type: 'roomTransfer'` document containing only the deposit and advance top-up line items. Its `roomId` is the new room; its `tenantId` is snapshotted at save.
_Avoid_: Adjustment bill, transfer invoice

**Room history**:
The ordered array on the tenant document (`tenant.roomHistory[]`) recording each past transfer's from/to rooms, date, resolved rates, and the signed top-up.
_Avoid_: Transfer log, room log, tenant history
