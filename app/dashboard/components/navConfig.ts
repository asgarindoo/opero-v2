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
  Bot,
  BarChart2,
  FileBarChart,
  Activity,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Material Symbols icon name for command palette */
  materialIcon: string;
  href: string;
  badge?: number;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, materialIcon: "dashboard", href: "/dashboard" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "tasks",  label: "Tasks",  icon: CheckSquare, materialIcon: "task_alt",    href: "/dashboard/tasks"  },
      { id: "flows",  label: "Flows",  icon: GitFork,     materialIcon: "account_tree", href: "/dashboard/flows"  },
      { id: "goals",  label: "Goals",  icon: Target,      materialIcon: "flag",         href: "/dashboard/goals"  },
    ],
  },
  {
    label: "TEAM",
    items: [
      { id: "chat",    label: "Team Chat", icon: MessageSquare, materialIcon: "forum", href: "/dashboard/chat"    },
      { id: "members", label: "Members",   icon: Users,         materialIcon: "group", href: "/dashboard/members" },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { id: "contacts",  label: "Contacts",  icon: UserRound,   materialIcon: "contacts",    href: "/dashboard/contacts"  },
      { id: "sales",     label: "Sales",     icon: ShoppingCart,materialIcon: "shopping_cart",href: "/dashboard/sales"     },
      { id: "inventory", label: "Inventory", icon: Package,     materialIcon: "inventory_2", href: "/dashboard/inventory" },
      { id: "assets",    label: "Assets",    icon: Landmark,    materialIcon: "account_balance",href: "/dashboard/assets"  },
      { id: "finance",   label: "Finance",   icon: CreditCard,  materialIcon: "credit_card",  href: "/dashboard/finance"  },
      { id: "invoices",  label: "Invoices",  icon: Receipt,     materialIcon: "receipt",      href: "/dashboard/invoices" },
      { id: "documents", label: "Documents", icon: FileText,    materialIcon: "description",  href: "/dashboard/documents"},
    ],
  },
  {
    label: "MARKETING",
    items: [
      { id: "campaigns",      label: "Campaigns",      icon: Megaphone, materialIcon: "campaign",      href: "/dashboard/campaigns"       },
      { id: "content-planner",label: "Content Planner",icon: Calendar,  materialIcon: "calendar_month", href: "/dashboard/content-planner" },
      { id: "social-channels",label: "Social Channels",icon: Share2,    materialIcon: "share",          href: "/dashboard/social-channels" },
    ],
  },
  {
    label: "CONNECT",
    items: [
      { id: "bots", label: "Bot Manager", icon: Bot, materialIcon: "smart_toy", href: "/dashboard/bots" },
    ],
  },
  {
    label: "MONITOR",
    items: [
      { id: "insights",  label: "Insights",     icon: BarChart2,   materialIcon: "bar_chart",  href: "/dashboard/insights"  },
      { id: "reports",   label: "Reports",      icon: FileBarChart,materialIcon: "summarize",   href: "/dashboard/reports"   },
      { id: "activity",  label: "Activity Log", icon: Activity,    materialIcon: "history",     href: "/dashboard/activity"  },
    ],
  },
];
