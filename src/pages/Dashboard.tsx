import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Announcements } from "@/components/Announcements";
import { Button } from "@/components/ui/button";
import { Loader, PageLoader } from "@/components/ui/loader";
import { Plus, FileText, Trash2, Calendar } from "lucide-react";
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

interface Document {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoadingDocs(false);
  };

  const createNewDocument = async () => {
    if (!user) return;
    
    setCreatingDoc(true);
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: "Untitled Document",
        content: "",
      })
      .select("id")
      .single();

    setCreatingDoc(false);

    if (error) {
      toast.error("Failed to create document");
      return;
    }

    if (data) {
      navigate(`/editor/${data.id}`);
    }
  };

  const confirmDelete = (docId: string) => {
    setDocToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const deleteDocument = async () => {
    if (!docToDelete) return;

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docToDelete);

    if (error) {
      toast.error("Failed to delete document");
    } else {
      toast.success("Document deleted");
      setDocuments(documents.filter((d) => d.id !== docToDelete));
    }

    setDeleteDialogOpen(false);
    setDocToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">My Documents</h1>
              <Button onClick={createNewDocument} disabled={creatingDoc}>
                {creatingDoc ? (
                  <Loader size="sm" className="mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                New Document
              </Button>
            </div>

            {loadingDocs ? (
              <GlassCard variant="strong">
                <div className="flex items-center justify-center py-12">
                  <Loader size="lg" />
                </div>
              </GlassCard>
            ) : documents.length === 0 ? (
              <GlassCard variant="strong" className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first document to get started
                </p>
                <Button onClick={createNewDocument} disabled={creatingDoc}>
                  {creatingDoc ? (
                    <Loader size="sm" className="mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Document
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <GlassCard
                    key={doc.id}
                    variant="strong"
                    className="cursor-pointer hover:ring-2 hover:ring-primary/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div onClick={() => navigate(`/editor/${doc.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(doc.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Announcements />
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently deleted
              from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
