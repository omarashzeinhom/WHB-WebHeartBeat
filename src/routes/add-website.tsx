import { createFileRoute } from '@tanstack/react-router'
import AddWebsite from '../components/Pages/AddWebSite/AddWebsite'

export const Route = createFileRoute('/add-website')({
  component: AddWebsiteRoute,
})

function AddWebsiteRoute() {
  return <AddWebsite />
}