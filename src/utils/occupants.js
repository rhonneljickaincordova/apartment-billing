/**
 * Additional occupant helpers.
 *
 * A tenant record names one primary lessee (`tenant.fullName`) — the party who
 * signs the lease, pays, holds the deposit and moves out. Everything downstream
 * (bills, receipts, move-out, room transfer) keys off that single tenant.
 *
 * `tenant.occupants[]` lists the other people authorized to live in the unit. They
 * are named in the lease's Occupancy clause but are not parties to it: they do not
 * sign, and they hold no balance of their own.
 */

/**
 * Drop blank rows and trim the rest. The form keeps empty rows around while the
 * user is typing; only real entries should reach Firestore or the contract.
 * @param {array} occupants
 * @returns {Array<{ name: string, relationship: string }>}
 */
export function normalizeOccupants(occupants = []) {
  if (!Array.isArray(occupants)) return [];
  return occupants
    .map((occupant) => ({
      name: (occupant?.name || '').trim(),
      relationship: (occupant?.relationship || '').trim(),
    }))
    .filter((occupant) => occupant.name !== '');
}

/**
 * Named occupants excluding the primary tenant.
 * @param {object} tenant
 * @returns {Array<{ name: string, relationship: string }>}
 */
export function getOccupants(tenant) {
  return normalizeOccupants(tenant?.occupants);
}

/**
 * Everyone living in the unit: the primary tenant plus the named occupants.
 * This is the number to compare against the room's water-billing person count.
 * @param {object} tenant
 * @returns {number}
 */
export function getTotalOccupantCount(tenant) {
  return getOccupants(tenant).length + (tenant?.fullName ? 1 : 0);
}

/**
 * One occupant rendered for the contract, e.g. "Maria Cordova — Spouse".
 * Relationship is optional, so a bare name is a valid line.
 * @param {{ name: string, relationship: string }} occupant
 * @returns {string}
 */
export function formatOccupantLine(occupant) {
  const name = (occupant?.name || '').trim();
  const relationship = (occupant?.relationship || '').trim();
  return relationship ? `${name} — ${relationship}` : name;
}

/**
 * The sentence that follows the occupant list in the lease. Kept here so the three
 * contract renderers (print window, on-screen preview, PDF) can't drift apart.
 */
export const OCCUPANCY_CLAUSE_RESTRICTION =
  'No other person may reside in the Unit without the prior written consent of the Lessor.';

/**
 * Lead-in sentence for the Occupancy clause, worded to match whether anyone
 * besides the primary tenant is listed.
 * @param {number} occupantCount - Named occupants, excluding the primary tenant
 * @returns {string}
 */
export function getOccupancyIntro(occupantCount) {
  return occupantCount > 0
    ? 'The Unit shall be occupied solely by the Lessee and the following authorized occupants:'
    : 'The Unit shall be occupied solely by the Lessee.';
}

/**
 * Escape a value for interpolation into generated markup. Two of the three contract
 * renderers build HTML as strings, and occupant names are free text.
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The Occupancy clause body as HTML, shared by the print-window and PDF renderers.
 * @param {object} tenant
 * @param {{ listStyle?: string, itemStyle?: string }} [styles] - Inline styles for
 *   the PDF renderer, which cannot rely on the print stylesheet's classes.
 * @returns {string}
 */
export function renderOccupancyClauseHtml(tenant, styles = {}) {
  const occupants = getOccupants(tenant);
  const intro = getOccupancyIntro(occupants.length);

  const list = occupants.length
    ? `<ul${styles.listStyle ? ` style="${styles.listStyle}"` : ' class="sub-list"'}>${occupants
        .map(
          (occupant) =>
            `<li${styles.itemStyle ? ` style="${styles.itemStyle}"` : ''}>${escapeHtml(formatOccupantLine(occupant))}</li>`
        )
        .join('')}</ul>`
    : '';

  return { intro: escapeHtml(intro), list, restriction: escapeHtml(OCCUPANCY_CLAUSE_RESTRICTION) };
}
