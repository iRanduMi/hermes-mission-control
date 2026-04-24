import { Link, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchClear: () => void;
}

const navItems = [
  { label: 'Kanban Board', path: '/' },
  { label: 'Monitoring', path: '/monitoring' },
];

export default function Header({ searchQuery, onSearchChange, onSearchClear }: Props) {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync search query via keyboard events for / shortcut
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Only trigger / when not in an input
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

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tasks... /"
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg border border-panel-border bg-panel text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={onSearchClear}
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
    </header>
  );
}
