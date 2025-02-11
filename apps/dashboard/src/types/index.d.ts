export interface SidebarMenuOption {
  name: string;
  href: string;
  icon: any;
  current: boolean;
}

export interface User {
  name: string;
  level: number;
  change: 'up' | 'down';
}

export interface MenuSection {
  title: string;
  options: SidebarMenuOption[];
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  icon_url: string;
  botInGuild: boolean;
  memberType: string;
}

export interface DiscordGuildChannel {
  id: string;
  name: string;
  type: number;
  position: number;
  permission_overwrites: unknown[];
  parent_id: string;
  nsfw: boolean;
}

