import { redirect } from 'next/navigation';
import { getDashboardEditHref } from '@/app/dashboard/dashboardTabs';

type EditTaskRedirectPageProps = {
  params: Promise<{ id: string }>;
};

/** Legacy URL — edit lives in the dashboard post-task flow. */
export default async function EditTaskRedirectPage({ params }: EditTaskRedirectPageProps) {
  const { id } = await params;
  redirect(getDashboardEditHref('task', decodeURIComponent(id)));
}
