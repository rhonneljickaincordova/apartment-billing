# MonthlyCollectionReport misattributes historical payments after room transfer

## Summary

`components/dashboard/MonthlyCollectionReport.jsx` aggregates per-tenant move-in payments, refunds, and advance payments keyed by `tenant.roomId` (lines 114, 133, 139, 153). This is the tenant's *current* room. After a room transfer, all of the tenant's historical inflows appear under the new room in the report, corrupting per-room revenue attribution.

## Repro

1. Tenant A moves into Room 1, pays deposit + advance = ₱10,000.
2. Report for that month correctly shows ₱10,000 under Room 1.
3. Tenant A transfers to Room 2.
4. Re-open the same past-month report.

**Expected:** ₱10,000 still shown under Room 1 (that's where the money was collected).

**Actual:** ₱10,000 now shown under Room 2.

## Root cause

Same class of bug as the payment-receipt misattribution: uses `tenant.roomId` as if it were the tenant's identity at billing time. Historical facts get rewritten every time the tenant moves.

## Suggested fix

Aggregate by `bill.roomId` (already snapshotted on bills) rather than by `tenant.roomId`. For payments not tied to a bill (e.g. deposit/advance stored on tenant), consult `tenant.roomHistory[]` to find the room the tenant was in on the payment date.

## Labels

- needs-triage

## References

- Introduced by: room-transfer feature design (see `CONTEXT.md`, ADR-0001)
- Related: `.scratch/issues/receipt-misattributes-tenant-after-transfer.md`
