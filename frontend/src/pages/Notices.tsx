import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { Bell, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useApiList } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Event', 'Holiday', 'Meeting', 'Academic'];

export function Notices() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { data: notices = [], isLoading, error } = useApiList<any>('notices');
  const navigate = useNavigate();

  const filtered = notices.filter(n =>
    (activeCategory === 'All' || n.category === activeCategory) &&
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={isLoading ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Notice Management" description="Create and manage school notices and announcements." onAdd={() => navigate('/notices/new')} addEnabled addLabel="Create Notice" />
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load notices. Please sign in again or retry.</p>}

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {cat}
          </button>
        ))}
        <div className="flex-1 max-w-xs">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="h-8 w-full rounded-lg border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((notice, i) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <StatusBadge status={notice.status} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${notice.priority === 'High' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-700'}`}>
                  {notice.priority}
                </span>
                <button
                  onClick={() => toast(`Viewing: ${notice.title}`)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-1">{notice.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notice.content}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">By {notice.author}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{notice.date}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{notice.targetAudience}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
