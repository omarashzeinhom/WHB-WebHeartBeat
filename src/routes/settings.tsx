import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '../pages/Settings/SettingsPage'

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  return <SettingsPage/>
}