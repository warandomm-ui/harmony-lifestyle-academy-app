/**
 * Returns true only when the user explicitly selected Islam.
 * Every other selection (Buddhism, Christianity, Hinduism,
 * Sikhism, Other, Prefer not to say, or empty) gets universal content.
 */
export const isMuslim = (religion: string = ''): boolean =>
  religion.trim().toLowerCase() === 'islam';
