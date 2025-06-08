import { Outlet } from "react-router-dom";
import { PageLayout } from "./layout/PageLayout";

const Layout = () => {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

export default Layout;
