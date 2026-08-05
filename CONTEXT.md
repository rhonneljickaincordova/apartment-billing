# Apartment Bill Tracker

The apartment-side context of this repo — rooms, tenants, monthly utility bills, and the money the landlord holds on the tenant's behalf. This glossary pins down terms that recur across bills, tenants, and room transfers.

## Language

### Money held on the tenant's behalf

**Advance payment**:
One month's rent collected at move-in that covers the tenant's final month. Refundable at move-out only if unused.
_Avoid_: Prepayment, prepaid rent, last-month rent

**Security deposit**:
One month's rent collected at move-in and held against damages or unpaid dues. Returnable at move-out net of deductions.
_Avoid_: Bond, damage deposit

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
