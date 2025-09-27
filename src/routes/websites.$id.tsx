import { createFileRoute } from '@tanstack/react-router'
import WebsiteDetail from '../components/Pages/DashBoard/WebsiteDetail/WebSiteDetail'
import { useState, useEffect } from 'react'
import { Website } from '../models/website'
import { TauriService } from '../services/TauriService'

export const Route = createFileRoute('/websites/$id')({
  component: WebsiteDetailRoute,
})

function WebsiteDetailRoute() {
  const { id } = Route.useParams()
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(false)
  const [screenshotLoading, setScreenshotLoading] = useState(false)

  useEffect(() => {
    loadWebsite()
  }, [id])

  const loadWebsite = async () => {
    try {
      const websites = await TauriService.loadWebsites()
      const foundWebsite = websites.find(w => w.id === parseInt(id))
      setWebsite(foundWebsite || null)
    } catch (error) {
      console.error('Failed to load website:', error)
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleCheck = async () => { // Removed unused websiteId parameter
    setLoading(true)
    try {
      if (website) {
        const updatedWebsite = await TauriService.checkWebsite(website)
        setWebsite(updatedWebsite)
      }
    } catch (error) {
      console.error('Error checking website:', error)
    }
    setLoading(false)
  }

  const handleTakeScreenshot = async () => { // Removed unused websiteId parameter
    setScreenshotLoading(true)
    try {
      if (website) {
        const updatedWebsite = await TauriService.takeScreenshot(website)
        setWebsite(updatedWebsite)
      }
    } catch (error) {
      console.error('Error taking screenshot:', error)
    }
    setScreenshotLoading(false)
  }

  const handleToggleFavorite = () => { // Removed unused websiteId parameter
    if (website) {
      setWebsite({ ...website, favorite: !website.favorite })
      // You might want to save this change to your data store
    }
  }

  const handleRemove = async (websiteId: number) => {
    try {
      // Remove the website from your data store
      const websites = await TauriService.loadWebsites()
      const updatedWebsites = websites.filter(w => w.id !== websiteId)
      await TauriService.saveWebsites(updatedWebsites)
      // Navigate back after removal
      handleBack()
    } catch (error) {
      console.error('Error removing website:', error)
    }
  }

  if (!website) {
    return (
      <div className="loading-container">
        <p>Loading website...</p>
      </div>
    )
  }

  return (
    <WebsiteDetail
      website={website}
      websiteId={parseInt(id)}
      onBack={handleBack}
      onCheck={handleCheck}
      onTakeScreenshot={handleTakeScreenshot}
      onToggleFavorite={handleToggleFavorite}
      onRemove={handleRemove}
      loading={loading}
      screenshotLoading={screenshotLoading}
    />
  )
}