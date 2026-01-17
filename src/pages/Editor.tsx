import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { TextEditor } from "@/components/editor/TextEditor";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, PageLoader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Download,
  Trash2,
  Check,
  Cloud,
  CloudOff,
  Edit2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

interface Document {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Document not found");
      navigate("/dashboard");
      return;
    }

    setDocument(data);
    setTitleInput(data.title);
    contentRef.current = data.content || "";
    setLoading(false);
  };

  const saveDocument = useCallback(async (content: string, title?: string) => {
    if (!id || !user) return;

    setSaving(true);
    const updateData: { content?: string; title?: string } = {};
    
    if (content !== undefined) {
      updateData.content = content;
    }
    if (title !== undefined) {
      updateData.title = title;
    }

    const { error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save");
    } else {
      setLastSaved(new Date());
    }
  }, [id, user]);

  const handleContentChange = useCallback((content: string) => {
    contentRef.current = content;
    setDocument((prev) => prev ? { ...prev, content } : null);

    // Debounce autosave
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(content);
    }, 1500);
  }, [saveDocument]);

  const handleTitleSave = async () => {
    if (!titleInput.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    await saveDocument(contentRef.current, titleInput);
    setDocument((prev) => prev ? { ...prev, title: titleInput } : null);
    setEditingTitle(false);
    toast.success("Title updated");
  };

  const handleDownload = () => {
    if (!document) return;

    const element = window.document.createElement("a");
    const content = stripHtml(document.content || "");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    toast.success("Document downloaded");
  };

  const stripHtml = (html: string) => {
    const sanitized = sanitizeRichText(html);
    const parsed = new DOMParser().parseFromString(sanitized, "text/html");
    return parsed.body.textContent || "";
  };

  const handleDelete = async () => {
    if (!id) return;

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete document");
    } else {
      toast.success("Document deleted");
      navigate("/dashboard");
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!document) {
    return null;
  }

  const editorControls = (
    <>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="h-9 text-base font-semibold bg-background/50 max-w-[200px] lg:max-w-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTitleInput(document.title);
                  setEditingTitle(false);
                }
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleTitleSave}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer group min-w-0"
            onClick={() => setEditingTitle(true)}
          >
            <h1 className="text-base lg:text-lg font-semibold line-clamp-1 truncate">
              {document.title}
            </h1>
            <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saving ? (
            <>
              <Loader size="sm" />
              <span className="hidden xl:inline">Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Cloud className="h-4 w-4 text-primary" />
              <span className="hidden xl:inline">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4" />
              <span className="hidden xl:inline">Not saved</span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="hidden lg:flex"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hidden lg:flex"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Header editorControls={editorControls} />

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile Top Bar */}
        <GlassCard variant="strong" className="mb-4 md:mb-6 p-3 md:p-4 shadow-xl lg:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="h-9 text-lg font-semibold bg-background/50 max-w-[200px] md:max-w-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave();
                      if (e.key === "Escape") {
                        setTitleInput(document.title);
                        setEditingTitle(false);
                      }
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={handleTitleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setEditingTitle(true)}
                >
                  <h1 className="text-lg md:text-xl font-semibold line-clamp-1">
                    {document.title}
                  </h1>
                  <Edit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saving ? (
                  <>
                    <Loader size="sm" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Cloud className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Not saved</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size={isMobile ? "icon" : "sm"}
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Download</span>}
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "icon" : "sm"}
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Delete</span>}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Editor */}
        <TextEditor
          content={document.content || ""}
          onChange={handleContentChange}
        />
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. "{document.title}" will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
