import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { UsersIcon } from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import styles from './admin-dashboard.module.css';

type TDashboardCardProps = {
  title: string;
  icon: React.ReactElement;
  onClick: () => void;
};

const DashboardCard = (props: TDashboardCardProps) => (
  <div className={styles.dashboardCard} onClick={props.onClick}>
    <Spacings.Stack alignItems="center" scale="m">
      <div className={styles.iconContainer}>
        <div className={styles.iconWrapper}>
          {props.icon}
        </div>
      </div>
      <Text.Headline as="h3">{props.title}</Text.Headline>
    </Spacings.Stack>
  </div>
);
DashboardCard.displayName = 'DashboardCard';

const AdminDashboard = () => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();

  const handleOnboardSeller = () => {
    history.push(`${match.url}/onboard-seller`);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.dashboardTitle}>
          <Text.Headline as="h1" intlMessage={messages.title} />
        </div>
      </div>
      <div className={styles.dashboardGrid}>
        <DashboardCard
          title={intl.formatMessage(messages.onboardSeller)}
          icon={<UsersIcon size="big" color="surface" />}
          onClick={handleOnboardSeller}
        />
      </div>
    </div>
  );
};
AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard; 