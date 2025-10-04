// hooks/useWpscan.ts
import { useState } from 'react';
import { WpscanResult } from '../models/WpscanResult';
import { invoke } from '@tauri-apps/api/core';

export const useWpscan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<WpscanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanWebsite = async (url: string, apiKey: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // Create a complete website object with all required fields
      const website = { 
        url, 
        id: 0, 
        name: url, 
        industry: '', 
        vitals: null,
        status: null,
        lastChecked: null,
        projectStatus: 'wip',
        favorite: false, // Add this field
        screenshot: null,
        isWordPress: false
      };
      
      const scanResult: WpscanResult = await invoke('scan_website', { 
        website, 
        apiKey 
      });
      
      setResult(scanResult);
    } catch (err) {
      setError(err as string);
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanWebsite,
    isScanning,
    result,
    error
  };
};