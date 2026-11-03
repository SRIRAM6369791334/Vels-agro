export type UserRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';
export type UserTeam = 'Operations' | 'Warehouse' | 'Production' | 'Sales' | 'Finance' | 'Support';

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  team: UserTeam;
  role: UserRole;
  email: string;
  phone: string;
  locId: string;
  tone: string;
  status: 'active' | 'away';
  avatar?: string;
}
