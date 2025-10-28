import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { mainMenu } from "@/config/menu";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLogo } from "./app-logo";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/services/supabaseClient";
import { fetchUserById } from "@/services/userService";
import { EditProfileModal } from "./profile/EditProfileModal";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
} | null;

export function AppHeader() {
  const [openEdit, setOpenEdit] = useState(false);
  const [user, setUser] = useState<SupabaseUser>(null);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);

  const loadProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setUser(null);
      setProfile(null);
      return;
    }

    setUser(data.user);
    const profileData = await fetchUserById(data.user.id);
    if (profileData) setProfile(profileData);
  };

  useEffect(() => {
    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    const channel = supabase
      .channel("realtime:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          if (
            payload.new &&
            "id" in payload.new &&
            payload.new.id === user?.id
          ) {
            loadProfile();
          }
        }
      )
      .subscribe();

    const handleLocalUpdate = () => loadProfile();
    window.addEventListener("profileUpdated", handleLocalUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("profileUpdated", handleLocalUpdate);
      authListener.subscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="w-full max-w-7xl mx-auto flex items-center gap-2 h-14 px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-0">
          {/* 🍔 Mobile Menu Hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {mainMenu.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link
                    to={item.url}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/">
            <AppLogo />
          </Link>
        </div>

        <div className="ml-4 flex-1 flex items-center justify-between">
          <div className="flex-1">
            <nav className="hidden md:flex gap-1">
              {mainMenu.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md p-2.5 text-sm hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-foreground/70"
                    )
                  }
                >
                  {item.icon && <item.icon />}
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <nav className="flex items-center gap-2">
            {profile && (
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium leading-none text-foreground">
                  @{profile.username || "user"}
                </span>
              </div>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        profile?.avatar_url ||
                        user?.user_metadata?.avatar_url ||
                        "/imagenotfound.jpeg"
                      }
                      alt={profile?.username || "User"}
                    />
                    <AvatarFallback>
                      {profile?.username?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "No email"}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                  Edit profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) console.error("Logout error:", error.message);
                    window.location.href = "/login";
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      <EditProfileModal open={openEdit} onOpenChange={setOpenEdit} />
    </header>
  );
}
