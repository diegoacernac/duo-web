import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'

export function TabsLayout() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
