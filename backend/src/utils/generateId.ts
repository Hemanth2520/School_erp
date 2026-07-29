export function generateCustomId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${Date.now().toString(36).slice(-4)}${random}`.slice(0, 12);
}
