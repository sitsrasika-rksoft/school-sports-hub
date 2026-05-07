import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Trophy,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Users,
  Dumbbell,
  UserCheck,
  Calendar,
  BarChart3,
  Building,
  HeartPulse,
  FileText,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
type SubNavItem = {
  to: string;
  label: string;
  adminOnly?: boolean;
};

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubNavItem[];
};

/* ------------------------------------------------------------------ */
/* NAV CONFIG */
/* ------------------------------------------------------------------ */
const baseNavEn: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pages/sports", label: "Sports Hub", icon: Trophy },
  { to: "/pages/athletes", label: "Athletes", icon: Users },
  { to: "/pages/training", label: "Training Programs", icon: Dumbbell },
  {
    to: "/pages/coaches",
    label: "Coaches & Staff",
    icon: UserCheck,
    children: [
      { to: "/pages/coaches", label: "Overview" },
      { to: "/pages/coaches/directory", label: "Coach Directory" },
      { to: "/pages/coaches/certifications", label: "Certifications" },
      { to: "/pages/coaches/assignments", label: "Athlete Assignment" },
      { to: "/pages/coaches/performance", label: "Performance Tracking" },
    ],
  },
  { to: "/pages/events", label: "Events & Tournaments", icon: Calendar },
  { to: "/pages/performance", label: "Performance & KPIs", icon: BarChart3 },
  { to: "/pages/facilities", label: "Facilities", icon: Building },
  { to: "/pages/health", label: "Health & Fitness", icon: HeartPulse },
  { to: "/pages/reports", label: "Reports", icon: FileText },
];

const baseNavSi: NavItem[] = [
  { to: "/dashboard", label: "පුවරුව", icon: LayoutDashboard },
  { to: "/pages/sports", label: "ක්‍රීඩා මධ්‍යස්ථානය", icon: Trophy },
  { to: "/pages/athletes", label: "ක්‍රීඩකයින්", icon: Users },
  { to: "/pages/training", label: "පුහුණු වැඩසටහන්", icon: Dumbbell },
  {
    to: "/pages/coaches",
    label: "පුහුණුකරුවන් සහ කාර්ය මණ්ඩලය",
    icon: UserCheck,
    children: [
      { to: "/pages/coaches", label: "සාරාංශය" },
      { to: "/pages/coaches/directory", label: "පුහුණුකරුවන්ගේ නාමාවලිය" },
      { to: "/pages/coaches/certifications", label: "සහතික සහ සම්මාන" },
      { to: "/pages/coaches/assignments", label: "ක්‍රීඩක වෙන්කිරීම්" },
      { to: "/pages/coaches/performance", label: "කාර්යසාධන අධීක්ෂණය" },
    ],
  },
  { to: "/pages/events", label: "තරඟ සහ උත්සව", icon: Calendar },
  { to: "/pages/performance", label: "කාර්යසාධන දර්ශක", icon: BarChart3 },
  { to: "/pages/facilities", label: "පහසුකම්", icon: Building },
  { to: "/pages/health", label: "සෞඛ්‍ය සහ ශාරීරික හැසිරීම්", icon: HeartPulse },
  { to: "/pages/reports", label: "වාර්තා", icon: FileText },
];

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, isAdmin, signOut } = useAuth();
  const { lang, setLang } = useLanguage(); // ✅ GLOBAL LANGUAGE
  setLang(lang);

  const navigate = useNavigate();
  const location = useLocation();
  
  
  const t = translations[lang];


   // const { lang, setLang } = useLanguage();
    //const tNew = translations[lang];

  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* REAL‑TIME CLOCK */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDateTime = now.toLocaleString(
    lang === "si" ? "si-LK" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  );

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  // const navItems: NavItem[] = isAdmin
  //   ? [...baseNav, { to: "/users", label: "Users", icon: ShieldCheck }]
  //   : baseNav;
  const baseNav: NavItem[] = lang === "si" ? baseNavSi : baseNavEn;
  const navItems: NavItem[] = isAdmin
  ? [
      ...baseNav,
      {
        to: "/users",
        label: lang === "si" ? "පරිශීලකයින්" : "Users",
        icon: ShieldCheck,
      },
    ]
  : baseNav;


  return (
    <div
      className={cn(
        "min-h-screen bg-background flex",
        lang === "si" && "font-sinhala", // ✅ SINHALA FONT APPLIED HERE
      )}
    >
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* LOGO */}
          <div className="px-6 py-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div
                className="h-20 w-20 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: "var(--gradient-primary)" }}
              >
                <img
                  src="/src/assets/images/oba_logo.jpg"    
                  alt="Logo"
                  className="h-14 w-14 object-contain"
                />
              </div>
              {/* <div
                className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                SS
              </div> */}
              <div>
                <div className="font-bold text-sidebar-foreground">
                  Sports Committee
                </div>
                <div className="text-xs text-muted-foreground">
                  OBA - Bandaranayake College
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2 mt-8">
               <p className="text-xs">{t.changeLang} </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLang(lang === "en" ? "si" : "en")}
              >
                {t.toggle}
              </Button>
            </div>
          </div>
          

          {/* NAVIGATION */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              const hasChildren = !!item.children;

              return (
                <div key={item.to}>
                  <button
                    onClick={() =>
                      hasChildren
                        ? setExpanded(expanded === item.to ? null : item.to)
                        : navigate({ to: item.to })
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {hasChildren && (
                      <span>{expanded === item.to ? "▾" : "▸"}</span>
                    )}
                  </button>

                  {hasChildren && expanded === item.to && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.children!.map((child) => {
                        if (child.adminOnly && !isAdmin) return null;
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* USER FOOTER */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="px-3 py-2 mb-2">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className="text-xs capitalize text-muted-foreground">
                {role ?? "—"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {formattedDateTime}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <Link to="/dashboard" className="font-bold">
            SportsSociety
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}










// import { Link, useNavigate, useLocation } from "@tanstack/react-router";
// import { useAuth } from "@/lib/auth-context";
// import { Button } from "@/components/ui/button";
// import {
//   LayoutDashboard,
//   Trophy,
//   ShieldCheck,
//   LogOut,
//   Menu,
//   X,
//   Users,
//   Dumbbell,
//   UserCheck,
//   Calendar,
//   BarChart3,
//   Building,
//   HeartPulse,
//   FileText,
// } from "lucide-react";
// import { useEffect, useState, type ReactNode } from "react";
// import { cn } from "@/lib/utils";

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */
// type SubNavItem = {
//   to: string;
//   label: string;
//   adminOnly?: boolean;
// };

// type NavItem = {
//   to: string;
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
//   children?: SubNavItem[];
// };

// /* ------------------------------------------------------------------ */
// /* NAV CONFIG */
// /* ------------------------------------------------------------------ */
// // const baseNav: NavItem[] = [
// //   { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
// //   { to: "/pages/sports", label: "Sports Hub", icon: Trophy },
// //   { to: "/pages/athletes", label: "Athletes", icon: Users },
// //   { to: "/pages/training", label: "Training Programs", icon: Dumbbell },

// //   {
// //     to: "/pages/coaches",
// //     label: "Coaches & Staff",
// //     icon: UserCheck,
// //     children: [
// //       { to: "/pages/coaches", label: "Coach List" },
// //       { to: "/pages/coaches/add", label: "Add Coach", adminOnly: true },
// //     ],
// //   },

// //   { to: "/pages/events", label: "Events & Tournaments", icon: Calendar },
// //   { to: "/pages/performance", label: "Performance & KPIs", icon: BarChart3 },
// //   { to: "/pages/facilities", label: "Facilities", icon: Building },
// //   { to: "/pages/health", label: "Health & Fitness", icon: HeartPulse },
// //   { to: "/pages/reports", label: "Reports", icon: FileText },
// // ];

// const baseNav: NavItem[] = [
//   { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { to: "/pages/sports", label: "Sports Hub", icon: Trophy },
//   { to: "/pages/athletes", label: "Athletes", icon: Users },
//   { to: "/pages/training", label: "Training Programs", icon: Dumbbell },

 
//   {
//     to: "/pages/coaches",
//     label: "Coaches & Staff",
//     icon: UserCheck,
//     children: [
//       { to: "/pages/coaches", label: "Overview" },
//       { to: "/pages/coaches/directory", label: "Coach Directory" },
//       { to: "/pages/coaches/certifications", label: "Certifications" },
//       { to: "/pages/coaches/assignments", label: "Athlete Assignment" },
//       { to: "/pages/coaches/performance", label: "Performance Tracking" },
//     ],
//   },


//   { to: "/pages/events", label: "Events & Tournaments", icon: Calendar },
//   { to: "/pages/performance", label: "Performance & KPIs", icon: BarChart3 },
//   { to: "/pages/facilities", label: "Facilities", icon: Building },
//   { to: "/pages/health", label: "Health & Fitness", icon: HeartPulse },
//   { to: "/pages/reports", label: "Reports", icon: FileText },
// ];


// /* ------------------------------------------------------------------ */
// /* COMPONENT */
// /* ------------------------------------------------------------------ */
// export function AppShell({ children }: { children: ReactNode }) {
//   const { user, role, isAdmin, signOut } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [expanded, setExpanded] = useState<string | null>(null);

//   /* REAL‑TIME CLOCK */
//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     const interval = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const formattedDateTime = now.toLocaleString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });

//   const handleSignOut = async () => {
//     await signOut();
//     navigate({ to: "/login" });
//   };

//   const navItems: NavItem[] = isAdmin
//     ? [...baseNav, { to: "/users", label: "Users", icon: ShieldCheck }]
//     : baseNav;

//   return (
//     <div className="min-h-screen bg-background flex">
//       {/* SIDEBAR */}
//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:static lg:translate-x-0",
//           sidebarOpen ? "translate-x-0" : "-translate-x-full",
//         )}
//       >
//         <div className="flex flex-col h-full">
//           {/* LOGO */}
//           <div className="px-6 py-6 border-b border-sidebar-border">
//             <Link to="/dashboard" className="flex items-center gap-2">
//               <div
//                 className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-primary-foreground"
//                 style={{ background: "var(--gradient-primary)" }}
//               >
//                 SS
//               </div>
//               <div>
//                 <div className="font-bold text-sidebar-foreground">
//                   Sports Committee
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   OBA - Bandaranayake College
//                 </div>
//               </div>
//             </Link>
//           </div>

//           {/* NAVIGATION */}
//           <nav className="flex-1 p-3 space-y-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const active = location.pathname.startsWith(item.to);
//               const hasChildren = !!item.children;

//               return (
//                 <div key={item.to}>
//                   {/* MAIN ITEM */}
//                   <button
//                     onClick={() =>
//                       hasChildren
//                         ? setExpanded(expanded === item.to ? null : item.to)
//                         : navigate({ to: item.to })
//                     }
//                     className={cn(
//                       "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
//                       active
//                         ? "bg-sidebar-primary text-sidebar-primary-foreground"
//                         : "text-sidebar-foreground hover:bg-sidebar-accent",
//                     )}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="flex-1">{item.label}</span>
//                     {hasChildren && (
//                       <span className="text-xl">
//                         {expanded === item.to ? "▾" : "▸"}
//                       </span>
//                     )}
//                   </button>

//                   {/* SUB‑MENU */}
//                   {hasChildren && expanded === item.to && (
//                     <div className="ml-9 mt-1 space-y-1">
//                       {item.children!.map((child) => {
//                         if (child.adminOnly && !isAdmin) return null;

//                         const childActive =
//                           location.pathname === child.to;

//                         return (
//                           <Link
//                             key={child.to}
//                             to={child.to}
//                             onClick={() => setSidebarOpen(false)}
//                             className={cn(
//                               "block px-3 py-1.5 rounded-md text-sm",
//                               childActive
//                                 ? "bg-sidebar-accent text-sidebar-foreground"
//                                 : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
//                             )}
//                           >
//                             {child.label}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>

//           {/* USER FOOTER */}
//           <div className="p-3 border-t border-sidebar-border">
//             <div className="px-3 py-2 mb-2">
//               <div className="text-sm font-medium truncate">
//                 {user?.email}
//               </div>
//               <div className="text-xs capitalize text-muted-foreground">
//                 {role ?? "—"}
//               </div>
//               <div className="text-[11px] text-muted-foreground mt-1">
//                 {formattedDateTime}
//               </div>
//             </div>

//             <Button
//               variant="ghost"
//               size="sm"
//               className="w-full justify-start"
//               onClick={handleSignOut}
//             >
//               <LogOut className="h-4 w-4 mr-2" />
//               Sign out
//             </Button>
//           </div>
//         </div>
//       </aside>

//       {/* MOBILE OVERLAY */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
//           <Link to="/dashboard" className="font-bold">
//             SportsSociety
//           </Link>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setSidebarOpen((v) => !v)}
//           >
//             {sidebarOpen ? (
//               <X className="h-5 w-5" />
//             ) : (
//               <Menu className="h-5 w-5" />
//             )}
//           </Button>
//         </header>

//         <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
//       </div>
//     </div>
//   );
// }
