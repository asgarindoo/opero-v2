"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  CheckSquare,
  GitFork,
  Target,
  MessageSquare,
  Users,
  UserRound,
  ShoppingCart,
  Package,
  Landmark,
  CreditCard,
  Receipt,
  FileText,
  Megaphone,
  Share2,
  Radio,
  Bot,
  BarChart2,
  FileBarChart,
  Activity,
  Settings,
  ChevronsUpDown,
  Calendar,
  type LucideIcon,
} from "lucide-react";

/* ─── Nav definition ─── */
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

interface NavGroup {
  label: string | null; // null = no section label (Dashboard row)
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
      { id: "flows", label: "Flows", icon: GitFork, href: "/dashboard/flows" },
      { id: "goals", label: "Goals", icon: Target, href: "/dashboard/goals" },
    ],
  },
  {
    label: "TEAM",
    items: [
      { id: "chat", label: "Team Chat", icon: MessageSquare, href: "/dashboard/chat" },
      { id: "members", label: "Members", icon: Users, href: "/dashboard/members" },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { id: "contacts", label: "Contacts", icon: UserRound, href: "/dashboard/contacts" },
      { id: "sales", label: "Sales", icon: ShoppingCart, href: "/dashboard/sales" },
      { id: "inventory", label: "Inventory", icon: Package, href: "/dashboard/inventory" },
      { id: "assets", label: "Assets", icon: Landmark, href: "/dashboard/assets" },
      { id: "finance", label: "Finance", icon: CreditCard, href: "/dashboard/finance" },
      { id: "invoices", label: "Invoices", icon: Receipt, href: "/dashboard/invoices" },
      { id: "documents", label: "Documents", icon: FileText, href: "/dashboard/documents" },
    ],
  },
  {
    label: "MARKETING",
    items: [
      { id: "campaigns", label: "Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
      { id: "content-planner", label: "Content Planner", icon: Calendar, href: "/dashboard/content-planner" },
      { id: "social-channels", label: "Social Channels", icon: Share2, href: "/dashboard/social-channels" },
    ],
  },
  {
    label: "CONNECT",
    items: [
      { id: "bots", label: "Bot Manager", icon: Bot, href: "/dashboard/bots" },
    ],
  },
  {
    label: "MONITOR",
    items: [
      { id: "insights", label: "Insights", icon: BarChart2, href: "/dashboard/insights" },
      { id: "reports", label: "Reports", icon: FileBarChart, href: "/dashboard/reports" },
      { id: "activity", label: "Activity Log", icon: Activity, href: "/dashboard/activity" },
    ],
  },
];

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = (session?.user as { role?: string })?.role ?? "member";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    
    // Ensure "Overview" (/dashboard/marketing) doesn't stay active when on sub-pages like /social
    const isExact = pathname === href;
    const isSubPath = pathname.startsWith(href + "/");
    
    if (isExact) return true;
    if (!isSubPath) return false;

    // If it's a subpath, we need to check if there's a more specific match in the nav
    const allItems = NAV_GROUPS.flatMap(g => g.items);
    const hasMoreSpecificMatch = allItems.some(item => 
      item.href !== href && item.href.startsWith(href) && pathname.startsWith(item.href)
    );

    return !hasMoreSpecificMatch;
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div
        className="flex items-center shrink-0 px-4 border-b"
        style={{ height: 52, borderColor: "rgba(0,0,0,0.06)" }}
      >
        <Link
          href="/dashboard"
          onClick={onClose}
          className="font-display font-bold tracking-[-0.05em] text-primary select-none shrink-0"
          style={{ fontSize: 20 }}
        >
          OP<span className="opacity-60">E</span>RO
        </Link>
        {!collapsed && (
          <span
            className="ml-2 font-label-caps text-[9px] uppercase tracking-[0.08em] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface-variant)" }}
          >
            Beta
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto db-sidebar py-2 px-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={group.label !== null ? "mb-3" : "mb-1"}>

            {/* Section label — hidden for Dashboard row */}
            {group.label !== null && !collapsed && (
              <div
                className="font-label-caps text-[9px] uppercase font-semibold px-2 mb-1 mt-1"
                style={{
                  color: "var(--color-on-surface-variant)",
                  opacity: 0.6,
                  letterSpacing: "0.13em",
                }}
              >
                {group.label}
              </div>
            )}

            {/* Collapsed state: subtle hairline separator between groups */}
            {group.label !== null && collapsed && gi > 0 && (
              <div
                className="mx-auto mb-2 mt-1"
                style={{ width: 18, height: 1, background: "rgba(0,0,0,0.07)" }}
              />
            )}

            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "relative flex items-center gap-2.5 rounded-[6px] mb-[1px] transition-all duration-150",
                    collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-[6px]",
                    active
                      ? "db-nav-active"
                      : "hover:bg-black/[0.035] text-on-surface-variant",
                  ].join(" ")}
                >
                  <Icon
                    size={14}
                    strokeWidth={active ? 2.25 : 1.7}
                    style={{
                      color: active
                        ? "var(--color-on-surface)"
                        : "var(--color-on-surface-variant)",
                      opacity: active ? 1 : 0.6,
                      flexShrink: 0,
                    }}
                  />

                  {!collapsed && (
                    <span
                      className="font-body-md text-[12.5px] font-medium leading-none flex-1"
                      style={{
                        color: active
                          ? "var(--color-on-surface)"
                          : "var(--color-on-surface-variant)",
                        opacity: active ? 1 : 0.6,
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Badge — expanded */}
                  {"badge" in item && item.badge !== undefined && !collapsed && (
                    <span
                      className="font-label-caps text-[8px] font-bold px-[5px] py-[2px] rounded-full"
                      style={{
                        background: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Badge dot — collapsed */}
                  {"badge" in item && item.badge !== undefined && collapsed && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--color-primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Settings + User ── */}
      <div className="shrink-0 px-2 pb-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={[
            "relative flex items-center gap-2.5 rounded-[6px] mt-2 transition-all duration-150 hover:bg-black/[0.035]",
            collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-[6px]",
          ].join(" ")}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings
            size={14}
            strokeWidth={1.7}
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, flexShrink: 0 }}
          />
          {!collapsed && (
            <span
              className="font-body-md text-[12.5px] font-medium"
              style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
            >
              Settings
            </span>
          )}
        </Link>

        {/* User pill */}
        {!collapsed && (
          <div className="flex items-center gap-2 mt-1 px-2.5 py-[6px] rounded-[6px] cursor-pointer hover:bg-black/[0.035] transition-colors duration-150">
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[10px] shrink-0"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body-sm text-[12px] font-semibold text-on-surface truncate">
                {userName}
              </div>
              <div
                className="font-body-sm text-[10px] truncate"
                style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
              >
                {userRole}
              </div>
            </div>
            <ChevronsUpDown
              size={12}
              strokeWidth={1.7}
              style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, flexShrink: 0 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 h-full overflow-hidden border-r"
        style={{
          width: collapsed ? 56 : 240,
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          background: "var(--color-surface-container-low)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 left-0 z-50 h-full flex flex-col lg:hidden border-r"
        style={{
          width: 240,
          background: "var(--color-surface-container-low)",
          borderColor: "rgba(0,0,0,0.06)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <SidebarContent collapsed={false} onClose={onClose} />
      </aside>
    </>
  );
}
