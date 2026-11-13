import { MOCKS_ENABLED } from '@/mocks/data';

export default function MockBadge() {
  if (!MOCKS_ENABLED) return null;

  return (
    <span className="mock-badge" role="status" aria-label="Using mock data">
      MOCK DATA
    </span>
  );
}
