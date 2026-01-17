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
      <GlassCard className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Announcements</h2>
        </div>
        <Loader size="sm" />
      </GlassCard>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <GlassCard className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Announcements</h2>
      </div>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 rounded-lg bg-accent/30 border border-border/50"
          >
            <h3 className="font-medium text-foreground mb-2">{announcement.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(announcement.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
