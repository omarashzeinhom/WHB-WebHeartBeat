// types/navigation.ts
export type AppPage = 
  | 'dashboard' 
  | 'websites' 
  | 'add-website' 
  | 'analytics' 
  | 'security-scan' 
  | 'monitoring' 
  | 'export' 
  | 'import' 
  | 'cloud-sync' 
  | 'settings' 
  | 'donate' 
  | 'pro' 
  | 'contribute' 
  | 'community' 
  | 'help';

export interface NavigationState {
  currentPage: AppPage;
  previousPage: AppPage | null;
  pageParams: Record<string, any>;
}