// src/services/SearchService.ts
import { invoke } from '@tauri-apps/api/core';
import { Website } from '../models/website';

export interface SearchFilters {
  query: string;
  status: 'all' | 'online' | 'offline' | 'unknown';
  projectStatus: string;
  industry: string;
  favorite: boolean | null;
  isWordPress: boolean | null;
  limit?: number;
}

export interface SearchResult {
  websites: Website[];
  total_matches: number;
  has_more: boolean;
}

export interface SearchStats {
  total_websites: number;
  online_count: number;
  offline_count: number;
  unknown_count: number;
  wordpress_count: number;
  favorite_count: number;
  industries: string[];
  project_statuses: string[];
}

export class SearchService {
  static async searchWebsites(filters: SearchFilters): Promise<SearchResult> {
    try {
      // Convert frontend filters to backend format
      const backendFilters = {
        query: filters.query,
        status: filters.status,
        project_status: filters.projectStatus,
        industry: filters.industry,
        favorite: filters.favorite,
        is_wordpress: filters.isWordPress,
        limit: filters.limit
      };

      return await invoke<SearchResult>('search_websites', { 
        filters: backendFilters 
      });
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Search failed: ${error}`);
    }
  }

  static async quickSearch(query: string): Promise<Website[]> {
    try {
      return await invoke<Website[]>('quick_search', { query });
    } catch (error) {
      console.error('Quick search failed:', error);
      return [];
    }
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      return await invoke<string[]>('get_search_suggestions', { query });
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  static async getSearchStats(): Promise<SearchStats> {
    try {
      return await invoke<SearchStats>('get_search_stats');
    } catch (error) {
      console.error('Failed to get search stats:', error);
      throw new Error(`Failed to get search stats: ${error}`);
    }
  }

  // Helper method to debounce search calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}