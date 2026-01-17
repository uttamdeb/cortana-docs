import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from './GlassCard';
import { Bell } from 'lucide-react';
import { Loader } from './ui/loader';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <GlassCard variant="strong" className="w-full shadow-2xl border-l-4 border-l-primary/50">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Announcements</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader size="sm" />
        </div>
      </GlassCard>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <GlassCard variant="strong" className="w-full shadow-2xl border-l-4 border-l-primary/50">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Announcements</h2>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 rounded-lg glass border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-200"
          >
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{announcement.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
            <p className="text-xs text-muted-foreground/70 mt-3 flex items-center gap-1">
              {new Date(announcement.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
