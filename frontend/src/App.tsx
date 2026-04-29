import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, X, Moon, Sun } from 'lucide-react';
import { useState, createContext, useContext, useEffect, useRef } from 'react';
import KanbanBoard from './components/KanbanBoard';
import MonitoringPage from './components/MonitoringPage';

const queryClient = new QueryClient();

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const navItems = [
  { label: 'Kanban Board', path: '/' },
  { label: 'Monitoring', path: '/monitoring' },
];

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

function App() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Listen for system preference changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setDark(e.matches);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggleDark = () => setDark(d => !d);

  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-canvas flex flex-col">
            <HeaderInner onToggleDark={toggleDark} isDark={dark} />
            <Routes>
              <Route path="/" element={<KanbanBoard />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </SearchProvider>
    </QueryClientProvider>
  );
}

function HeaderInner({ onToggleDark, isDark }: { onToggleDark: () => void; isDark: boolean }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <header className="h-14 border-b border-panel-border bg-canvas-subtle/50 backdrop-blur-sm flex items-center px-4 justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-[590] text-text-primary tracking-tight">
          Mission<span style={{ color: 'var(--color-accent)' }}>Control</span>
        </span>
      </Link>

      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks... /"
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg border border-panel-border bg-panel text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-panel-hover text-text-muted/60 hover:text-text-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 shrink-0">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              location.pathname === item.path
                ? 'bg-accent-subtle text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-panel-hover'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={onToggleDark}
        className="shrink-0 p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-panel-hover transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

export default App;
