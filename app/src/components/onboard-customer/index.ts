import { lazy } from 'react';

const OnboardCustomer = lazy(
  () => import('./onboard-customer' /* webpackChunkName: "onboard-customer" */)
);

export default OnboardCustomer; 