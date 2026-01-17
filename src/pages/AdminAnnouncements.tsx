import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader, PageLoader } from "@/components/ui/loader";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnnouncements();
    }
  }, [user, isAdmin]);

  const fetchAnnouncements = async () => {
    // Admin can see all announcements including inactive ones
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const createAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    if (!user) return;

    setCreating(true);
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        content: newContent.trim(),
        is_active: true,
      })
      .select()
      .single();

    setCreating(false);

    if (error) {
      toast.error("Failed to create announcement");
    } else if (data) {
      toast.success("Announcement created");
      setAnnouncements([data, ...announcements]);
      setNewTitle("");
      setNewContent("");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      setAnnouncements(
        announcements.map((a) =>
          a.id === id ? { ...a, is_active: !isActive } : a
        )
      );
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Announcement deleted");
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Announcements</h1>

        {/* Create New */}
        <GlassCard variant="strong" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Announcement
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Announcement title"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What would you like to announce?"
                className="bg-background/50 min-h-[100px]"
              />
            </div>
            <Button onClick={createAnnouncement} disabled={creating}>
              {creating ? (
                <Loader size="sm" className="mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Post Announcement
            </Button>
          </div>
        </GlassCard>

        {/* Existing Announcements */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Announcements</h2>
          {announcements.length === 0 ? (
            <GlassCard variant="strong">
              <p className="text-muted-foreground text-center py-8">
                No announcements yet
              </p>
            </GlassCard>
          ) : (
            announcements.map((announcement) => (
              <GlassCard key={announcement.id} variant="strong">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${announcement.id}`} className="text-sm">
                        Active
                      </Label>
                      <Switch
                        id={`active-${announcement.id}`}
                        checked={announcement.is_active}
                        onCheckedChange={() =>
                          toggleActive(announcement.id, announcement.is_active)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
