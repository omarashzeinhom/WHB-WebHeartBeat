import { createFileRoute } from '@tanstack/react-router'
import WpscanPage from '../components/Pages/WpscanPage/WpscanPage'

export const Route = createFileRoute('/wpscan')({
  component: WpscanRoute,
})

function WpscanRoute() {
  return <WpscanPage />
}