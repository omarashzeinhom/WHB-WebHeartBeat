// components/AppRouter/AppRouter.tsx
import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import ComingSoon from '../Pages/ComingSoon/ComingSoon';
import DashBoard from '../Pages/DashBoard/DashBoard';

const AppRouter: React.FC = () => {
  const { currentPage, pageParams } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashBoard {...pageParams} />;
      case 'import':
      case 'cloud-sync':
      case 'community':
        return <ComingSoon pageName={currentPage} />;
      default:
        return <DashBoard {...pageParams} />;
    }
  };

  return (
    <div className="app-router">
      {renderPage()}
    </div>
  );
};

export default AppRouter;