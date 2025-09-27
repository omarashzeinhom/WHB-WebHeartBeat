// hooks/useNavigation.ts
import { useState, useCallback } from 'react';
import { AppPage, NavigationState } from '../types/navigation';

export const useNavigation = (initialPage: AppPage = 'dashboard') => {
  const [navigation, setNavigation] = useState<NavigationState>({
    currentPage: initialPage,
    previousPage: null,
    pageParams: {}
  });

  const navigate = useCallback((page: AppPage, params: Record<string, any> = {}) => {
    setNavigation(prev => ({
      currentPage: page,
      previousPage: prev.currentPage,
      pageParams: params
    }));
  }, []);

  const goBack = useCallback(() => {
    if (navigation.previousPage) {
      setNavigation(prev => ({
        currentPage: prev.previousPage!,
        previousPage: null,
        pageParams: {}
      }));
    }
  }, [navigation.previousPage]);

  return {
    currentPage: navigation.currentPage,
    pageParams: navigation.pageParams,
    navigate,
    goBack,
    canGoBack: !!navigation.previousPage
  };
};