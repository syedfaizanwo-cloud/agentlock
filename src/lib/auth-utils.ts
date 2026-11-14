export function sanitizeNextUrl(next: string | null | undefined): string {
  if (!next) return '/';
  if (
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('://') &&
    !next.includes('\\')
  ) {
    return next;
  }
  return '/';
}
