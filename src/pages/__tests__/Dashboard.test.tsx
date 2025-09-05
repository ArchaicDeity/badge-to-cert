import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Dashboard from '@/pages/Dashboard';
import { useAuth, type UserRole } from '@/lib/use-auth';


// Mock hooks and contexts used within Dashboard
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/use-enterprise-branding', () => ({
  __esModule: true,
  default: () => {},
}));

vi.mock('@/lib/use-auth', () => ({
  useAuth: vi.fn(),
}));

const renderForRole = (role: UserRole) => {
  (useAuth as unknown as vi.Mock).mockReturnValue({
    user: { id: '1', email: 't@example.com', name: 'Test', role },
    logout: vi.fn(),
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard Quick Actions visibility', () => {
  it('shows quick actions for ADMIN', () => {
    renderForRole('ADMIN');
    expect(screen.getByText('Create Cohort')).toBeInTheDocument();
  });

  it('shows quick actions for ENTERPRISE', () => {
    renderForRole('ENTERPRISE');
    expect(screen.getByText('Create Cohort')).toBeInTheDocument();
  });

  it('hides quick actions for VIEWER', () => {
    renderForRole('VIEWER');
    expect(screen.queryByText('Create Cohort')).not.toBeInTheDocument();
  });

  it('hides quick actions for ASSESSOR', () => {
    renderForRole('ASSESSOR');
    expect(screen.queryByText('Create Cohort')).not.toBeInTheDocument();
  });
});
