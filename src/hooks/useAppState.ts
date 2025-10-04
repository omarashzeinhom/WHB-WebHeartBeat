// hooks/useAppState.ts
import { useState } from 'react';
import {  AppState, AppStateController } from '../controllers/AppStateController';

const initialState: AppState = {
  websites: [],
  loading: false,
  screenshotLoading: false,
  activeTab: 'dashboard',
  cloudProvider: null,
  syncFrequency: 0,
  theme: 'light',
  searchResults: [],
  screenshotProgress: null,
  wpscanApiKey: '',
  wpscanFilter: 'all',
  wpscanResults: {},
  isWpscanning: false,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState);
  const controller = new AppStateController(setState);

  return { state, controller };
};

