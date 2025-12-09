import { Anchor, Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <MantineBreadcrumbs>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;

      if (isLast || !item.path) {
        return (
          <span key={index} style={{ color: 'var(--mantine-color-dimmed)' }}>
            {item.label}
          </span>
        );
      }

      return (
        <Anchor key={index} component={Link} to={item.path}>
          {item.label}
        </Anchor>
      );
    })}
  </MantineBreadcrumbs>
);

export default Breadcrumbs;
