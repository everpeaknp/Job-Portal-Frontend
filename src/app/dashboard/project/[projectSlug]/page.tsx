'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardCreateRoute from '../../DashboardCreateRoute';
import DashboardProjectDetail from '../../DashboardProjectDetail';
import { DASHBOARD_CREATE_SLUGS } from '../../dashboardTabs';

export default function DashboardProjectDetailPage() {
  const params = useParams();
  const projectSlug =
    typeof params.projectSlug === 'string' ? decodeURIComponent(params.projectSlug) : '';

  if (!projectSlug) {
    notFound();
  }

  if (projectSlug === DASHBOARD_CREATE_SLUGS.project) {
    return <DashboardCreateRoute tab="project" />;
  }

  return <DashboardProjectDetail projectSlug={projectSlug} />;
}
