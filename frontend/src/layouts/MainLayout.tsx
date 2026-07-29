import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { Toaster } from 'react-hot-toast';
import { ChevronRight, Home } from 'lucide-react';

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', href: '/' }];
  let path = '';
  segments.forEach(seg => {
    path += `/${seg}`;
    const name = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    crumbs.push({ name, href: path });
  });
  return crumbs;
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col">
        <Sidebar mobileOpen={false} onClose={() => {}} />
      </div>
      <div className="md:hidden">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNavbar onMenuToggle={() => setSidebarOpen(true)} />
        
        {/* Breadcrumbs */}
        {location.pathname !== '/' && (
          <div className="flex items-center gap-1.5 px-6 py-3 border-b border-border/50 bg-background/50">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                {i === breadcrumbs.length - 2 ? (
                  <span className="text-xs font-medium text-foreground">{crumb.name}</span>
                ) : (
                  <Link to={crumb.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'border border-border bg-card text-foreground shadow-lg text-sm',
          duration: 3000,
        }}
      />
    </div>
  );
}
