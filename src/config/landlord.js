import landlordSignature from '../assets/signiture.png';

/**
 * The landlord's details as they appear on tenant-facing documents — the lease
 * agreement (print window, on-screen preview and PDF) and the payment receipt.
 *
 * Defined once: this used to be copied verbatim into each contract renderer, so
 * correcting a phone number meant remembering all of them.
 */
export const LANDLORD_INFO = {
  name: 'Rhonnel Cordova',
  phone: '09276161535',
  property: 'Blk 13 Lot 30 Matutum St., Sto. Nino Bulusan, Central Park, Bangkal, Brgy Talomo Poblacion, Davao City',
};

/** Bundled URL of the landlord's signature image. */
export { landlordSignature };
