import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '../components/Pages/Settings/SettingsPage'

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  return <SettingsPage/>
}