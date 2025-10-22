// components/AppRouter/AppRouter.tsx
import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import ComingSoon from '../../pages/ComingSoon/ComingSoon';
import AddWebsite from '../../pages/AddWebSite/AddWebsite';
import DashBoard from '../../pages/DashBoard/DashBoard';
import WpscanPage from '../../pages/WpscanPage/WpscanPage';
import Settings from '../../pages/Settings/SettingsPage';
const AppRouter: React.FC = () => {
  const { currentPage, pageParams } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashBoard {...pageParams} />;
      case 'websites':
        return //<Websites {...pageParams} />;
      case 'add-website':
        return <AddWebsite {...pageParams} />;
      //case 'analytics':
        return // <Analytics {...pageParams} />;
      case 'security-scan':
        return <WpscanPage {...pageParams} />;
      //case 'monitoring':
        return //Monitoring {...pageParams} />;
      //case 'export':
        return //<Export {...pageParams} />;
      case 'settings':
        return  <Settings {...pageParams} />;
      //case 'import':
      //case 'cloud-sync':
      //case 'community':
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