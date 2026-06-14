'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Service } from './serviceListData';
import { getServiceAuthorProfilePath } from './serviceSlug';

type ServiceAuthorLinkProps = {
  service: Service;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

export default function ServiceAuthorLink({
  service,
  className,
  onClick,
  children,
}: ServiceAuthorLinkProps) {
  const href = getServiceAuthorProfilePath(service);

  if (!href) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
