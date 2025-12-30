// Force dynamic rendering to fix build error
export const dynamic = 'force-dynamic';

import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return <SettingsClient />;
}