import { DashboardLayout, PageContainer } from '@toolpad/core';
import { Outlet } from 'react-router-dom';

const Layout = () => (
  <DashboardLayout>
    <PageContainer>
      <Outlet />
    </PageContainer>
  </DashboardLayout>
);

export default Layout;
