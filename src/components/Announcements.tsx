import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from './GlassCard';
import { Bell, X } from 'lucide-react';
import { Loader } from './ui/loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

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
      <GlassCard variant="strong" className="w-full">
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
    <>
      <GlassCard variant="strong" className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Announcements</h2>
        </div>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 rounded-lg glass-strong border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <h3 className="font-medium text-foreground mb-2">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">{announcement.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="glass-strong max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedAnnouncement?.content}
            </p>
            <p className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border/50">
              Posted on {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
