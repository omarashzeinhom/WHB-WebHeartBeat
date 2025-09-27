import { createFileRoute } from '@tanstack/react-router'
import DashBoard from '../components/Pages/DashBoard/DashBoard'

export const Route = createFileRoute('/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return <DashBoard />
}