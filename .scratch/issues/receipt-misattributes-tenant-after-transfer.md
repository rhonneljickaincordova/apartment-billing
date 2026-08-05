# Payment receipt misattributes tenant after room transfer

## Summary

`ApartmentBillTracker.jsx:1326` resolves the tenant to show on a payment receipt via `tenants.find(t => t.roomId === bill.roomId && t.isActive !== false)`. Once room transfers exist, this returns the wrong tenant (or none) for any historical bill on a room the original tenant has since left.

## Repro

1. Tenant A is active in Room 1.
2. Bill created for Room 1 (`bill.roomId = room1Id`), fully paid.
3. Tenant A transfers to Room 2 (Tenant A's `roomId` becomes `room2Id`).
4. Open the payment receipt for the fully-paid Room 1 bill.

**Expected:** receipt shows Tenant A's name — they were the tenant when the bill was billed and paid.

**Actual:** receipt shows either no tenant, or the new tenant in Room 1 if one has moved in since.

## Root cause

The lookup uses the *current* `tenant.roomId` as the identity for the *historical* bill's tenant. Post-transfer the two no longer agree.

## Suggested fix

Snapshot `bill.tenantId` on every new bill going forward (already planned for transfer bills). For historical bills without `tenantId`, fall back to searching `tenant.roomHistory[]` for a room-and-date match.

## Labels

- needs-triage

## References

- Introduced by: room-transfer feature design (see `CONTEXT.md`, ADR-0001)
- Related: `.scratch/issues/monthly-collection-report-misattributes-after-transfer.md`
