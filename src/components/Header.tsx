import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, LogOut, Settings, User, Menu, X, Megaphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface HeaderProps {
  editorControls?: ReactNode;
  mobileEditorControls?: ReactNode;
}

export function Header({ editorControls, mobileEditorControls }: HeaderProps = {}) {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="glass-strong border-b border-border/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Cortana</span>
          </Link>
          
          {/* Desktop Editor Controls */}
          {editorControls && (
            <>
              <div className="hidden lg:block h-8 w-px bg-border/50 mx-2" />
              <div className="hidden lg:flex items-center flex-1 min-w-0 gap-4">
                {editorControls}
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 shrink-0">
          {!editorControls ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin/announcements">
                  <Button variant="ghost" size="sm">
                    <Megaphone className="mr-2 h-4 w-4" />
                    Manage Announcements
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to="/dashboard" className="hidden lg:block">
              <Button variant="ghost" size="sm">Back to Dashboard</Button>
            </Link>
          )}
          <DarkModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-strong w-56" align="end">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">@{profile?.username || 'username'}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-strong border-t border-border/50 px-4 py-4 space-y-4 shadow-lg animate-fade-in">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-sm text-muted-foreground">@{profile?.username || 'username'}</p>
            </div>
          </div>
          
          {/* Mobile Editor Controls */}
          {mobileEditorControls && (
            <div className="pb-4 border-b border-border/50">
              {mobileEditorControls}
            </div>
          )}
          
          {/* Navigation Links */}
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin/announcements" onClick={() => setMobileMenuOpen(false)} className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Megaphone className="mr-2 h-4 w-4" />
                Manage Announcements
              </Button>
            </Link>
          )}
          <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <div className="block">
            <DarkModeToggle variant="default" className="w-full justify-start" />
          </div>
          <div className="block">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
