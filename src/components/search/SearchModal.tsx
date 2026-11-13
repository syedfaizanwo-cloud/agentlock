'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, ArrowRight, CornerDownLeft, Shield, HelpCircle, FileText, Layers } from 'lucide-react';
import { searchSite, SearchMatch, SearchItem, SEARCH_INDEX } from '../../lib/search-index';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_KEY = 'agentlock_recent_searches';

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, [isOpen]);

  // Debounce search query by 150ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Run search when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const matches = searchSite(debouncedQuery);
      setResults(matches);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setDebouncedQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    const updated = [cleaned, ...recentSearches.filter((s) => s.toLowerCase() !== cleaned.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  // Handle item navigation
  const handleSelect = useCallback(
    (item: SearchItem) => {
      saveRecentSearch(query || item.title);
      onClose();

      if (item.url.startsWith('/#')) {
        const targetId = item.url.replace('/#', '');
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${targetId}`);
        }
        if (item.faqId) {
          window.dispatchEvent(
            new CustomEvent('open-faq-item', { detail: { faqId: item.faqId } })
          );
        }
      } else {
        window.location.href = item.url;
      }
    },
    [query, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].item);
        }
      }
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: SearchItem['category']) => {
    switch (cat) {
      case 'Section':
        return <Layers className="w-4 h-4 text-[#E6CBA8]" />;
      case 'Security':
        return <Shield className="w-4 h-4 text-[#E6CBA8]" />;
      case 'FAQ':
        return <HelpCircle className="w-4 h-4 text-[#B89B72]" />;
      case 'Legal':
        return <FileText className="w-4 h-4 text-[#8A8A8A]" />;
      default:
        return <Layers className="w-4 h-4 text-[#E6CBA8]" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Command & Vector Search"
      className="fixed inset-0 z-[110] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2A2A2A] bg-[#151515]">
          <Search className="w-5 h-5 text-[#E6CBA8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls="search-results-list"
            aria-activedescendant={
              results[selectedIndex] ? `search-item-${results[selectedIndex].item.id}` : undefined
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search runtime telemetry, policies, FAQ, security topics..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5C5C5C] font-mono focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#8A8A8A] hover:text-white p-1"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#8A8A8A] bg-[#0A0A0A] border border-[#2A2A2A] rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results / Recents / Empty State */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <ul id="search-results-list" role="listbox" ref={listRef} className="space-y-1">
                {results.map((match, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <li
                      id={`search-item-${match.item.id}`}
                      key={match.item.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(match.item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/50 text-white'
                          : 'hover:bg-[#151515] text-[#BDBDBD] border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{getCategoryIcon(match.item.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sans font-semibold text-xs text-white truncate">
                            {match.item.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1E1E1E] text-[#E6CBA8] shrink-0 border border-[#2A2A2A]">
                            {match.item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A8A8A] font-sans mt-0.5 line-clamp-1">
                          {match.item.description}
                        </p>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-1 transition-transform ${isSelected ? 'translate-x-0.5 text-[#E6CBA8]' : 'text-transparent'}`} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-mono text-[#8A8A8A]">
                  No runtime security vectors found for <span className="text-white font-bold">&quot;{query}&quot;</span>
                </p>
                <p className="text-[11px] text-[#5C5C5C] font-sans">
                  Try searching for &quot;SSRF&quot;, &quot;Offline&quot;, &quot;Telemetry&quot;, &quot;Audit&quot;, or &quot;Kill switch&quot;.
                </p>
              </div>
            )
          ) : (
            <div className="p-3 space-y-4">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] px-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#E6CBA8]" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="hover:text-white transition-colors lowercase underline"
                    >
                      clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-2.5 py-1 rounded-lg bg-[#151515] hover:bg-[#1E1E1E] text-xs font-mono text-[#BDBDBD] hover:text-white border border-[#2A2A2A] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Jump Suggestions */}
              <div className="space-y-1.5 px-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
                  Suggested Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    { label: 'Source & Egress Security', id: 'sec-security' },
                    { label: 'Live Telemetry', id: 'sec-telemetry' },
                    { label: 'Tamper-Proof Audit', id: 'sec-audit-explorer' },
                    { label: 'Frequently Asked Questions', id: 'sec-faq' },
                  ].map((s) => {
                    const item = SEARCH_INDEX.find((i) => i.id === s.id);
                    if (!item) return null;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="p-2 rounded-xl bg-[#151515] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-left text-xs font-mono text-[#BDBDBD] hover:text-[#E6CBA8] transition-colors truncate"
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#0D0D0D] border-t border-[#2A2A2A] flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E1E1E] border border-[#2A2A2A] text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E1E1E] border border-[#2A2A2A] text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1E1E1E] border border-[#2A2A2A] text-[10px]">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="text-[#E6CBA8] flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            Jump directly
          </span>
        </div>
      </div>
    </div>
  );
};
