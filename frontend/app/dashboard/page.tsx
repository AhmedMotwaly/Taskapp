// Force this page to be dynamic, skipping the Prerender Build Error
export const dynamic = 'force-dynamic';

import DashboardClient from './DashboardClient';

export default function Page() {
  return <DashboardClient />;
}