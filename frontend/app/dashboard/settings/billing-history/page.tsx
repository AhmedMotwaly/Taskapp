// This ensures the page is built dynamically, skipping the Static Prerender error
export const dynamic = 'force-dynamic';

import BillingClient from './BillingClient';

export default function Page() {
  return <BillingClient />;
}