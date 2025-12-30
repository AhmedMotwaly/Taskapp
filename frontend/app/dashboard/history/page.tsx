// Force dynamic rendering to fix build error
export const dynamic = 'force-dynamic';

import HistoryClient from './HistoryClient';

export default function HistoryPage() {
  return <HistoryClient />;
}