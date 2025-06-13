import type { ReactNode } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import AdminRoutes from './admin-routes';
import DashboardRoutes from './dashboard-routes';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/admin`}>
        <AdminRoutes />
      </Route>
      <Route path={`${match.path}`}>
        <DashboardRoutes />
      </Route>
    </Switch>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
