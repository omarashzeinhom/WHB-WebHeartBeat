// src/components/Layout/AdvancedWebsiteSearch/AdvancedWebsiteSearch.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Website } from '../../../models/website';
import './AdvancedWebsiteSearch.css';
import { SearchFilters, SearchService, SearchStats } from '../../../services/SearchService';

interface AdvancedWebsiteSearchProps {
    onWebsiteSelect?: (website: Website) => void;
    compact?: boolean;
}

const AdvancedWebsiteSearch: React.FC<AdvancedWebsiteSearchProps> = ({
    onWebsiteSelect,
    compact = false
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Website[]>([]);
    const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        status: 'all',
        projectStatus: 'all',
        industry: 'all',
        favorite: null,
        isWordPress: null
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Load search stats on component mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await SearchService.getSearchStats();
                setSearchStats(stats);
            } catch (error) {
                console.error('Failed to load search stats:', error);
            }
        };
        loadStats();
    }, []);

    // Debounced search function
    // In the performSearch function, add these logs:
    const performSearch = useCallback(
        async (searchFilters: SearchFilters) => {
            console.log('🔍 Performing search with filters:', searchFilters);

            if (!searchFilters.query.trim() &&
                searchFilters.status === 'all' &&
                searchFilters.projectStatus === 'all' &&
                searchFilters.industry === 'all' &&
                searchFilters.favorite === null &&
                searchFilters.isWordPress === null) {
                console.log('❌ No search criteria, clearing results');
                setSearchResults([]);
                setTotalMatches(0);
                return;
            }

            setIsLoading(true);
            try {
                console.log('📡 Calling SearchService.searchWebsites...');
                const result = await SearchService.searchWebsites({
                    ...searchFilters,
                    limit: compact ? 5 : 10
                });
                console.log('✅ Search results received:', {
                    count: result.websites.length,
                    total: result.total_matches,
                    hasMore: result.has_more
                });
                setSearchResults(result.websites);
                setTotalMatches(result.total_matches);
            } catch (error) {
                console.error('❌ Search error:', error);
                setSearchResults([]);
                setTotalMatches(0);
            } finally {
                setIsLoading(false);
            }
        },
        [compact]
    );
    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const searchFilters = { ...filters, query };
            performSearch(searchFilters);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters, query, performSearch]);

    // Get search suggestions
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const sugg = await SearchService.getSearchSuggestions(query);
                setSuggestions(sugg);
            } catch (error) {
                console.error('Failed to get suggestions:', error);
                setSuggestions([]);
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Keyboard navigation and event handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev < searchResults.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (searchResults[selectedIndex]) {
                        handleSelectWebsite(searchResults[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    inputRef.current?.blur();
                    break;
                case 'Tab':
                    if (suggestions.length > 0 && query) {
                        e.preventDefault();
                        setQuery(suggestions[0]);
                        setSuggestions([]);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, searchResults, selectedIndex, suggestions, query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchResults]);

    const handleSelectWebsite = (website: Website) => {
        setIsOpen(false);
        setQuery('');
        setSuggestions([]);
        onWebsiteSelect?.(website);
        navigate({ to: '/websites/$id', params: { id: website.id.toString() } });
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const clearFilters = () => {
        setFilters({
            query: '',
            status: 'all',
            projectStatus: 'all',
            industry: 'all',
            favorite: null,
            isWordPress: null
        });
        setQuery('');
    };

    const getStatusBadge = (status: number | null) => {
        if (status === 200) return <span className="status-badge online">●</span>;
        if (status === null) return <span className="status-badge unknown">●</span>;
        return <span className="status-badge offline">●</span>;
    };

    const getStatusText = (status: number | null) => {
        if (status === 200) return 'Online';
        if (status === null) return 'Unknown';
        return `Error ${status}`;
    };

    const hasActiveFilters = () => {
        return filters.status !== 'all' ||
            filters.projectStatus !== 'all' ||
            filters.industry !== 'all' ||
            filters.favorite !== null ||
            filters.isWordPress !== null;
    };

    return (
        <div className={`advanced-search ${compact ? 'compact' : ''}`} ref={searchRef}>
            <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder={compact ? "Search..." : "Search websites... (Ctrl+K)"}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />

                {(query || hasActiveFilters()) && (
                    <button
                        className="clear-btn"
                        onClick={clearFilters}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}

                {isLoading && (
                    <div className="search-spinner"></div>
                )}
            </div>

            {isOpen && (
                <div className="search-dropdown">
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && query && searchResults.length === 0 && (
                        <div className="suggestions-section">
                            <div className="section-header">Suggestions</div>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filters Section - Only show in non-compact mode */}
                    {!compact && (
                        <div className="search-filters">
                            <div className="filter-group">
                                <label>Status:</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters((prev: SearchFilters) => ({
                                        ...prev,
                                        status: e.target.value as 'all' | 'online' | 'offline' | 'unknown'
                                    }))}
                                >
                                    <option value="all">All</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Project:</label>
                                <select
                                    value={filters.projectStatus}
                                    onChange={(e) => setFilters((prev: SearchFilters) => ({
                                        ...prev,
                                        projectStatus: e.target.value
                                    }))}
                                >
                                    <option value="all">All</option>
                                    {searchStats?.project_statuses.map((status: string) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Industry:</label>
                                <select
                                    value={filters.industry}
                                    onChange={(e) => setFilters((prev: SearchFilters) => ({
                                        ...prev,
                                        industry: e.target.value
                                    }))}
                                >
                                    <option value="all">All</option>
                                    {searchStats?.industries.map((industry: string) => (
                                        <option key={industry} value={industry}>{industry}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-toggles">
                                <button
                                    className={`filter-toggle ${filters.favorite === true ? 'active' : ''}`}
                                    onClick={() => setFilters((prev: SearchFilters) => ({
                                        ...prev,
                                        favorite: prev.favorite === true ? null : true
                                    }))}
                                >
                                    ★ Favorites
                                </button>

                                <button
                                    className={`filter-toggle ${filters.isWordPress === true ? 'active' : ''}`}
                                    onClick={() => setFilters((prev: SearchFilters) => ({
                                        ...prev,
                                        isWordPress: prev.isWordPress === true ? null : true
                                    }))}
                                >
                                    WordPress
                                </button>
                            </div>

                            {hasActiveFilters() && (
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Results Section */}
                    <div className="search-results">
                        {isLoading ? (
                            <div className="loading-results">
                                <div className="loading-spinner"></div>
                                <p>Searching websites...</p>
                            </div>
                        ) : searchResults.length === 0 && query ? (
                            <div className="no-results">
                                <p>No websites found</p>
                                <p className="hint">Try adjusting your search or filters</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <>
                                <div className="results-header">
                                    <span>
                                        {totalMatches} result{totalMatches !== 1 ? 's' : ''}
                                        {totalMatches > searchResults.length && ` (showing ${searchResults.length})`}
                                    </span>
                                    <span className="hint">Use ↑↓ to navigate, Enter to select</span>
                                </div>

                                {searchResults.map((website, index) => (
                                    <div
                                        key={website.id}
                                        className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelectWebsite(website)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        {!compact && (
                                            <div className="result-preview">
                                                {website.screenshot ? (
                                                    <img
                                                        src={website.screenshot}
                                                        alt={website.name}
                                                        className="result-thumbnail"
                                                    />
                                                ) : (
                                                    <div className="result-thumbnail-placeholder">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <path d="m9 11 3 3 3-3" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="result-content">
                                            <div className="result-header">
                                                <h4>{website.name}</h4>
                                                <div className="result-badges">
                                                    {getStatusBadge(website.status)}
                                                    {website.favorite && <span className="favorite-badge">★</span>}
                                                    {website.isWordPress && <span className="wp-badge">WP</span>}
                                                </div>
                                            </div>

                                            <p className="result-url">{website.url}</p>

                                            <div className="result-meta">
                                                <span className="meta-item">{website.industry}</span>
                                                {website.projectStatus && (
                                                    <span className="meta-item">{website.projectStatus}</span>
                                                )}
                                                <span className={`meta-item status-${website.status === 200 ? 'online' :
                                                        website.status === null ? 'unknown' : 'offline'
                                                    }`}>
                                                    {getStatusText(website.status)}
                                                </span>
                                            </div>

                                            {website.tags && website.tags.length > 0 && (
                                                <div className="result-tags">
                                                    {website.tags.slice(0, 3).map((tag: string, i: number) => (
                                                        <span key={i} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedWebsiteSearch;