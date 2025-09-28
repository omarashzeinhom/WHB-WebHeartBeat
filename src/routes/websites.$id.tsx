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

  const handleCheck = async () => {
    setLoading(true)
    try {
      if (website) {
        const updatedWebsite = await TauriService.checkWebsite(website)
        setWebsite(updatedWebsite)
        // Save the updated website
        const websites = await TauriService.loadWebsites()
        const updatedWebsites = websites.map(w => 
          w.id === website.id ? updatedWebsite : w
        )
        await TauriService.saveWebsites(updatedWebsites)
      }
    } catch (error) {
      console.error('Error checking website:', error)
    }
    setLoading(false)
  }

  const handleTakeScreenshot = async () => {
    setScreenshotLoading(true)
    try {
      if (website) {
        const updatedWebsite = await TauriService.takeScreenshot(website)
        setWebsite(updatedWebsite)
        // Save the updated website
        const websites = await TauriService.loadWebsites()
        const updatedWebsites = websites.map(w => 
          w.id === website.id ? updatedWebsite : w
        )
        await TauriService.saveWebsites(updatedWebsites)
      }
    } catch (error) {
      console.error('Error taking screenshot:', error)
    }
    setScreenshotLoading(false)
  }

  const handleToggleFavorite = async () => {
    if (website) {
      const updatedWebsite = { ...website, favorite: !website.favorite }
      setWebsite(updatedWebsite)
      // Save the change
      const websites = await TauriService.loadWebsites()
      const updatedWebsites = websites.map(w => 
        w.id === website.id ? updatedWebsite : w
      )
      await TauriService.saveWebsites(updatedWebsites)
    }
  }

  const handleRemove = async (websiteId: number) => {
    try {
      const websites = await TauriService.loadWebsites()
      const updatedWebsites = websites.filter(w => w.id !== websiteId)
      await TauriService.saveWebsites(updatedWebsites)
      handleBack()
    } catch (error) {
      console.error('Error removing website:', error)
    }
  }

  // ADD THIS FUNCTION - Handle website updates (including notes)
  const handleUpdateWebsite = async (id: number, updates: Partial<Website>) => {
    try {
      const websites = await TauriService.loadWebsites()
      const updatedWebsites = websites.map(w => 
        w.id === id ? { ...w, ...updates } : w
      )
      await TauriService.saveWebsites(updatedWebsites)
      
      // Update local state
      setWebsite(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Failed to update website:', error)
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
      onUpdateWebsite={handleUpdateWebsite} // ADD THIS PROP
      loading={loading}
      screenshotLoading={screenshotLoading}
    />
  )
}