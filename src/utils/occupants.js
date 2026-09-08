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

import { numberWithWords } from './numberWords';

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
 * One occupant rendered for a plain list, e.g. "Maria Cordova — Spouse".
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
 * Everyone the lease authorizes to live in the unit, the Lessee first.
 *
 * The Lessee appears in the same list as the occupants but keeps their role, so
 * the contract names every resident without losing the distinction that only the
 * first of them signed it and is liable under it.
 *
 * @param {object} tenant
 * @returns {Array<{ name: string, role: string, relationship: string }>}
 */
export function getOccupancyPeople(tenant) {
  const people = [];

  const primaryName = (tenant?.fullName || '').trim();
  if (primaryName) {
    people.push({ name: primaryName, role: 'Lessee', relationship: '' });
  }

  getOccupants(tenant).forEach((occupant) => {
    people.push({ name: occupant.name, role: 'Occupant', relationship: occupant.relationship });
  });

  return people;
}

/**
 * One person on the Occupancy list, e.g. "Arjay Lambo — Occupant (Spouse)".
 * @param {{ name: string, role: string, relationship: string }} person
 * @returns {string}
 */
export function formatOccupancyPersonLine(person) {
  const role = person?.relationship ? `${person.role} (${person.relationship})` : person?.role;
  return `${person?.name} — ${role}`;
}

/**
 * The sentence that follows the occupant list in the lease. Kept here so the three
 * contract renderers (print window, on-screen preview, PDF) can't drift apart.
 */
export const OCCUPANCY_CLAUSE_RESTRICTION =
  'No other person may reside in the Unit without the prior written consent of the Lessor.';

/**
 * Lead-in sentence for the Occupancy clause.
 *
 * With additional occupants it introduces a numbered list of everyone and states
 * the total — the figure that should match the room's person count, which is what
 * water is billed on. With nobody else listed there is no list to introduce, so
 * it names the Lessee inline instead.
 *
 * @param {object} tenant
 * @returns {string}
 */
export function getOccupancyIntro(tenant) {
  const people = getOccupancyPeople(tenant);
  const hasAdditionalOccupants = getOccupants(tenant).length > 0;

  if (!hasAdditionalOccupants) {
    const primaryName = (tenant?.fullName || '').trim();
    return primaryName
      ? `The Unit shall be occupied solely by the Lessee, ${primaryName}.`
      : 'The Unit shall be occupied solely by the Lessee.';
  }

  return `The Unit shall be occupied solely by the following ${numberWithWords(people.length)} persons:`;
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
  const intro = getOccupancyIntro(tenant);

  // Only worth a list when someone besides the Lessee is named — otherwise the
  // intro already names them and a one-item list would just repeat it.
  const people = getOccupants(tenant).length > 0 ? getOccupancyPeople(tenant) : [];

  const list = people.length
    ? `<ol${styles.listStyle ? ` style="${styles.listStyle}"` : ' class="person-list"'}>${people
        .map(
          (person) =>
            `<li${styles.itemStyle ? ` style="${styles.itemStyle}"` : ''}>${escapeHtml(formatOccupancyPersonLine(person))}</li>`
        )
        .join('')}</ol>`
    : '';

  return { intro: escapeHtml(intro), list, restriction: escapeHtml(OCCUPANCY_CLAUSE_RESTRICTION) };
}
