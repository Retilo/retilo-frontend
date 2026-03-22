"use client"

import {
  LayoutDashboard,
  MessageSquareShare,
  Store,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#", active: true },
  { label: "Reviews", icon: MessageSquareShare, href: "#", badge: "9" },
  { label: "Stores", icon: Store, href: "#" },
  { label: "Insights", icon: TrendingUp, href: "#" },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border w-[220px]">

      {/* Logo */}
      <SidebarHeader className="h-14 flex-row items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-900/30">
          <MessageSquareShare className="size-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            Retilo
          </span>
          <span className="ml-1.5 rounded-sm bg-blue-600/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
            Beta
          </span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="p-2 pt-2.5">
        <div className="mb-1 px-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Workspace
          </span>
        </div>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={item.active}
                className="h-8.5 gap-2.5 text-[13px] font-medium"
              >
                <a href={item.href}>
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="bg-red-500/20 text-red-400 text-[10px] font-bold">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border/60" />

      {/* Bottom: settings + user */}
      <SidebarFooter className="p-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-8.5 gap-2.5 text-[13px] font-medium">
              <a href="#">
                <Settings className="size-4 shrink-0" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2 bg-sidebar-border/40" />

        {/* User row */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent cursor-pointer group">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-blue-600/20 text-[11px] font-bold text-blue-400">
              AV
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-sidebar-foreground">Alex V.</p>
            <p className="truncate text-[10px] text-sidebar-foreground/40">Store Manager</p>
          </div>
          <LogOut className="size-3.5 shrink-0 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
