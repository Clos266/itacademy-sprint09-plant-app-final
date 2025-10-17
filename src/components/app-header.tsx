import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { ChevronDown } from "lucide-react";
import { AppLogo } from "./app-logo";
import { AppSidebar } from "./app-sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "@/services/supabaseClient";
import { EditProfileModal } from "./profile/EditProfileModal";
import { fetchUserById } from "@/services/userService";

export function AppHeader() {
  const location = useLocation();
  const [openEdit, setOpenEdit] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // 🔹 Fetch current session user + profile info
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Fetch profile data from Supabase "profiles" table
        const profileData = await fetchUserById(user.id);
        if (profileData) setProfile(profileData);
      }
    };

    loadUser();
  }, []);

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="w-full ~max-w-7xl mx-auto flex items-center gap-2 h-14 px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-0">
          <AppSidebar />
          <Link to="/">
            <AppLogo />
          </Link>
        </div>

        <div className="ml-4 flex-1 flex items-center justify-between">
          {/* 🌿 Main menu */}
          <div className="flex-1">
            <nav className="hidden md:flex gap-1">
              {mainMenu.map((item, index) =>
                item.items && item.items.length > 0 ? (
                  <DropdownMenu key={index} modal={false}>
                    <DropdownMenuTrigger className="focus-visible:outline-none">
                      <NavLink
                        key={index}
                        to={item.url}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 rounded-md p-2.5 text-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:ring-2",
                            isActive
                              ? "text-foreground bg-accent"
                              : "text-foreground/70"
                          )
                        }
                      >
                        {item.icon && <item.icon />}
                        <span className="font-medium">{item.title}</span>
                        <ChevronDown className="!size-3 -ml-1" />
                      </NavLink>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-56">
                      {item.items.map((subItem, i) => (
                        <DropdownMenuItem key={i} asChild>
                          <NavLink
                            to={subItem.url}
                            className={cn(
                              "cursor-pointer",
                              subItem.url === location.pathname && "bg-muted"
                            )}
                          >
                            {subItem.title}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
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
                )
              )}
            </nav>
          </div>

          {/* 👤 User Menu */}
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

      {/* 🧩 Profile Edit Modal */}
      <EditProfileModal open={openEdit} onOpenChange={setOpenEdit} />
    </header>
  );
}
