import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminHelp from '@/pages/admin/AdminHelp';

// Mock Lucide icons to avoid rendering large SVGs
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('lucide-react')>();
  return {
    ...original,
    Zap: () => <div data-testid="icon-zap">Zap</div>,
    HelpCircle: () => <div>HelpCircle</div>,
    Globe: () => <div>Globe</div>,
    ShoppingCart: () => <div>ShoppingCart</div>,
    Package: () => <div>Package</div>,
    Factory: () => <div>Factory</div>,
    Type: () => <div>Type</div>,
    Save: () => <div>Save</div>,
    ToggleLeft: () => <div>ToggleLeft</div>,
    ChevronRight: () => <div>ChevronRight</div>,
    AlertTriangle: () => <div>AlertTriangle</div>,
    Mail: () => <div>Mail</div>,
    MousePointer2: () => <div>MousePointer2</div>,
    BarChart: () => <div>BarChart</div>,
    Gift: () => <div>Gift</div>,
    Settings2: () => <div>Settings2</div>,
    Layout: () => <div>Layout</div>,
    ShieldCheck: () => <div>ShieldCheck</div>,
    Palette: () => <div>Palette</div>,
    Database: () => <div>Database</div>,
    Send: () => <div>Send</div>,
    Info: () => <div>Info</div>,
    Key: () => <div>Key</div>,
    Newspaper: () => <div>Newspaper</div>,
    Loader2: (props: any) => <div data-testid="admin-loader" {...props}>Loader2</div>,
    Users: () => <div>Users</div>,
    FileText: () => <div>FileText</div>,
    Download: () => <div>Download</div>,
  };
});

// Mock ContentContext
const mockContent = {
  lang: 'cs',
  admin: {
    general: {
      loading: 'Načítám nápovědu...'
    },
    pricing: {
      card: {
        success: 'Ceny byly uloženy',
        successDesc: 'Změny se ihned projevily',
        errorTitle: 'Chyba',
        errorDesc: 'Něco se nepovedlo'
      }
    }
  }
};

let isLoading = false;
vi.mock('@/context/ContentContext', () => ({
  useContent: () => ({
    content: mockContent,
    loading: isLoading,
    refreshContent: vi.fn(),
  })
}));

// Mock React Router useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock ScrollArea component from shadcn
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>
}));

describe('AdminHelp Component', () => {
  beforeEach(() => {
    isLoading = false;
    mockNavigate.mockClear();
    
    // ResizeObserver mock
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('should render loader when loading content', () => {
    isLoading = true;
    render(<AdminHelp />);
    expect(screen.getByTestId('admin-loader')).toBeInTheDocument();
  });

  it('should render accordion headers and layout when not loading', () => {
    render(<AdminHelp />);
    
    // Check main title
    expect(screen.getByText('Administrátorský Manuál')).toBeInTheDocument();
    
    // Check if sections are rendered (e.g. Dashboard, Obsah webu)
    expect(screen.getByText('Přehled (Dashboard)')).toBeInTheDocument();
    expect(screen.getByText('Obsah webu')).toBeInTheDocument();
    expect(screen.getByText('Blog a články')).toBeInTheDocument();
  });

  it('should show default mockup when no item is selected', () => {
    render(<AdminHelp />);
    
    // By default, the first section (dashboard) should show the dashboard mockup
    // Look for dashboard mockup elements: test.drinkboostup.cz/admin
    expect(screen.getByText('test.drinkboostup.cz/admin')).toBeInTheDocument();
  });

  it('should update active mockup when clicking accordion trigger', async () => {
    render(<AdminHelp />);
    
    // Expand the emergency stop item
    const trigger = screen.getByText('Vypínač prodeje (Emergency Stop)');
    expect(trigger).toBeInTheDocument();
    
    fireEvent.click(trigger);
    
    // The mockup should update to show the emergency stop details: NOUZOVÝ VYPÍNAČ AKTIVNÍ
    expect(await screen.findByText('🔴 NOUZOVÝ VYPÍNAČ AKTIVNÍ')).toBeInTheDocument();
  });
});
