import { User } from '@/types';

// Mock authentication - replace with real auth service
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@tmsgruas.com',
    name: 'Administrador',
    role: 'admin',
    phone: '+54 11 1234-5678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'operator@tmsgruas.com',
    name: 'Juan Operador',
    role: 'operator',
    phone: '+54 11 8765-4321',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'viewer@tmsgruas.com',
    name: 'Ana Supervisora',
    role: 'viewer',
    phone: '+54 11 5555-5555',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'cliente@tmsgruas.com',
    name: 'María González',
    role: 'client',
    phone: '+56 9 1234 5678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    email: 'manager@tmsgruas.com',
    name: 'Carlos Gerente',
    role: 'manager',
    phone: '+54 11 4444-4444',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export class AuthService {
  private static readonly TOKEN_KEY = 'tms_auth_token';
  private static readonly USER_KEY = 'tms_user';

  static async login(email: string, password: string): Promise<User> {
    // Simplificado: cualquier contraseña funciona para facilitar pruebas
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const token = `mock_token_${user.id}_${Date.now()}`;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    return user;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  static hasRole(requiredRole: User['role']): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = { admin: 4, manager: 3, operator: 2, viewer: 1, client: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static canAccess(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Manager permissions
    if (user.role === 'manager') {
      if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'vehicles' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'clients' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'operators' && ['read', 'create'].includes(action)) return true;
      if (resource === 'tow-trucks' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'reports' && action === 'read') return true;
      if (resource === 'billing' && ['read', 'create'].includes(action)) return true;
      return false;
    }

    // Operator permissions
    if (user.role === 'operator') {
      if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
      if (resource === 'vehicles' && action === 'read') return true;
      if (resource === 'clients' && action === 'read') return true;
      return false;
    }

    // Viewer permissions
    if (user.role === 'viewer') {
      return action === 'read';
    }

    // Client permissions
    if (user.role === 'client') {
      if (resource === 'portal-cliente') return true;
      if (resource === 'services' && ['read', 'create'].includes(action)) return true;
      if (resource === 'invoices' && action === 'read') return true;
      return false;
    }

    return false;
  }
}