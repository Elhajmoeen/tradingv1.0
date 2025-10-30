import * as React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllLeads, selectAllClients, selectGlobalCustomDocuments } from '@/state/entitiesSlice';
import { norm, digits, scoreMatch } from './lib';
import { pickSearchStrings, pickDigitStrings } from './fields';

type EntityType = 'lead' | 'client';

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;     // display name
  subtitle?: string; // email/phone
  score: number;
  badge?: string;    // optional badge text
  // Enhanced fields for rich display
  firstName?: string;
  lastName?: string;
  email?: string;
  accountId?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface UseGlobalSearchOptions {
  maxResults?: number;
  debounceMs?: number;
  onNavigate?: (type: EntityType, id: string) => void;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const {
    maxResults = 20,
    debounceMs = 220,
    onNavigate
  } = options;
  
  const navigate = useNavigate();
  const leads = useSelector(selectAllLeads);
  const clients = useSelector(selectAllClients);
  const customDocs = useSelector(selectGlobalCustomDocuments);

  // String-controlled state - no numeric coercion
  const [query, setQuery] = React.useState<string>('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  
  // Cache for recent queries
  const cacheRef = React.useRef(new Map<string, SearchResult[]>());
  const lastRunIdRef = React.useRef(0);

  // Clear function
  const clear = React.useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  // Debounced search effect with race condition prevention
  React.useEffect(() => {
    const q = query.trim();
    if (!q) { 
      setResults([]);
      setIsSearching(false);
      return; 
    }

    // Check cache first
    const normalizedQuery = norm(q);
    const cached = cacheRef.current.get(normalizedQuery);
    if (cached) {
      setResults(cached.slice(0, maxResults));
      setIsSearching(false);
      return;
    }

    // Only set searching state after debounce delay to prevent flicker
    const searchingTimer = setTimeout(() => {
      setIsSearching(true);
    }, 100); // Short delay before showing "searching"
    
    // Increment run ID to handle race conditions
    const currentRunId = ++lastRunIdRef.current;
    
    const timer = setTimeout(() => {
      // Only proceed if this is still the latest search
      if (currentRunId !== lastRunIdRef.current) {
        clearTimeout(searchingTimer);
        return;
      }

      const needle = norm(q);
      const ndigs = digits(q);

      const searchOne = (rec: any, type: EntityType): SearchResult | null => {
        const { base, dyn } = pickSearchStrings(rec, customDocs);
        const baseJoin = base.map(s => norm(s)).join(' | ');
        const dynJoin = dyn.map(s => norm(s)).join(' | ');

        // textual score
        const s1 = scoreMatch(baseJoin, needle);
        const s2 = dynJoin ? scoreMatch(dynJoin, needle) : -1;

        // phone-like boost
        let s3 = -1;
        const phoneFields = pickDigitStrings(rec).map(digits);
        for (const ph of phoneFields) {
          const i = ph.indexOf(ndigs);
          if (ndigs && i >= 0) { 
            s3 = Math.max(s3, 80 - Math.min(i, 40)); 
          }
        }

        const best = Math.max(s1, s2, s3);
        if (best < 0) return null;

        // Build display name and subtitle
        const fullName = rec.fullName || 
          [rec.firstName, rec.lastName].filter(Boolean).join(' ') ||
          '';
        
        const title = fullName || rec.email || rec.phoneNumber || rec.accountId || rec.id;
        const subtitle = rec.email || rec.phoneNumber || rec.accountId || '';
        const badge = type === 'lead' ? 'Lead' : 'Client';

        return {
          id: rec.id,
          type,
          title,
          subtitle,
          score: best,
          badge,
          // Enhanced fields for rich display
          firstName: rec.firstName,
          lastName: rec.lastName,
          email: rec.email,
          accountId: rec.accountId,
          avatarUrl: rec.avatarUrl,
          isOnline: rec.lastLoginAt ? 
            (new Date().getTime() - new Date(rec.lastLoginAt).getTime()) < (15 * 60 * 1000) : // 15 minutes
            false,
        };
      };

      const pool: SearchResult[] = [];
      for (const r of leads) { 
        const hit = searchOne(r, 'lead'); 
        if (hit) pool.push(hit); 
      }
      for (const r of clients) { 
        const hit = searchOne(r, 'client'); 
        if (hit) pool.push(hit); 
      }

      // Sort by score desc
      pool.sort((a, b) => b.score - a.score);
      const finalResults = pool.slice(0, maxResults);
      
      // Cache results
      cacheRef.current.set(normalizedQuery, finalResults);
      
      // Clean cache if it gets too large (keep last 50 queries)
      if (cacheRef.current.size > 50) {
        const keys = Array.from(cacheRef.current.keys());
        keys.slice(0, 25).forEach(key => cacheRef.current.delete(key));
      }

      // Only update if this is still the current search
      if (currentRunId === lastRunIdRef.current) {
        clearTimeout(searchingTimer);
        setResults(finalResults);
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      clearTimeout(searchingTimer);
    };
  }, [query, leads, clients, customDocs, maxResults, debounceMs]);

  // Clear cache when dependencies change
  React.useEffect(() => {
    cacheRef.current.clear();
  }, [leads, clients, customDocs]);

  const handleSelect = React.useCallback((item: SearchResult) => {
    if (onNavigate) {
      onNavigate(item.type, item.id);
    } else {
      // Default navigation - both leads and clients go to profile page
      navigate(`/clients/${item.id}`);
    }
  }, [navigate, onNavigate]);

  return { 
    query, 
    setQuery, 
    results, 
    isSearching, 
    onSelect: handleSelect,
    clear 
  };
}