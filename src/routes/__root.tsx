import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { NavigationBar } from '../pages/DashBoard';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <main>
      <NavigationBar
        initialTheme={theme}
        onThemeChange={handleThemeChange}
      />
      <div className="main-container">
        <Outlet />
      </div>
    </main>
  )
}