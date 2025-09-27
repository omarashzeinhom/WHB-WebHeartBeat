import type React from "react"
import {
  ArrowLeft,
  Star,
  Trash2,
  RefreshCw,
  Camera,
  ExternalLink,
  Globe,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  Activity,
  Users,
  Puzzle,
  Eye,
  TrendingUp,
  ShoppingCart,
  Heart,
  Building,
  GraduationCap,
  Newspaper,
  Plane,
} from "lucide-react"
import type { Website } from "../../../../models/website"
import "./WebsiteDetail.css"

interface WebsiteDetailProps {
  website?: Website | null
  websiteId?: number
  onBack: () => void
  onCheck: (id: number) => void
  onTakeScreenshot: (id: number) => void
  onToggleFavorite: (id: number) => void
  onRemove: (id: number) => void
  loading: boolean
  screenshotLoading: boolean
}

const WebsiteDetail: React.FC<WebsiteDetailProps> = ({
  website,
  onBack,
  onCheck,
  onTakeScreenshot,
  onToggleFavorite,
  onRemove,
  loading,
  screenshotLoading,
}) => {
  // Early return if website is not available
  if (!website) {
    return (
      <div className="website-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
            Back to Dashboard
          </button>
        </div>
        <div className="detail-content">
          <div className="website-not-found">
            <Activity size={24} style={{ marginBottom: "1rem" }} />
            <p>Website not found or loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return "gray"
    if (status >= 200 && status < 300) return "green"
    if (status >= 300 && status < 400) return "blue"
    if (status >= 400 && status < 500) return "orange"
    return "red"
  }

  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      ecommerce: ShoppingCart,
      finance: TrendingUp,
      healthcare: Heart,
      education: GraduationCap,
      technology: Zap,
      media: Newspaper,
      travel: Plane,
      government: Building,
      nonprofit: Users,
      general: Globe,
    }
    const IconComponent = icons[industry] || Globe
    return <IconComponent size={16} style={{ marginRight: "0.5rem" }} />
  }

  return (
    <div className="website-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
          Back to Dashboard
        </button>
        <div className="header-actions">
          <button
            className={`favorite-btn ${website.favorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(website.id)}
            title={website.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={16} fill={website.favorite ? "currentColor" : "none"} />
          </button>
          <button className="remove-btn" onClick={() => onRemove(website.id)} title="Remove website">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="website-info">
          <div className="website-header">
            <h1>{website.name}</h1>
            <span className={`status status-${getStatusColor(website.status)}`}>{website.status || "Unknown"}</span>
          </div>

          <div className="website-url">
            <a href={website.url} target="_blank" rel="noopener noreferrer">
              <Globe size={16} style={{ marginRight: "0.5rem" }} />
              {website.url}
              <ExternalLink size={12} style={{ marginLeft: "0.5rem" }} />
            </a>
          </div>

          <div className="website-meta">
            <span className="industry-tag">
              {getIndustryIcon(website.industry)} {website.industry}
            </span>
            {website.lastChecked && (
              <span className="last-checked">
                <Clock size={14} style={{ marginRight: "0.5rem" }} />
                Last checked: {new Date(website.lastChecked).toLocaleString()}
              </span>
            )}
            {website.isWordPress !== undefined && (
              <span className="wordpress-tag">
                <Puzzle size={14} style={{ marginRight: "0.5rem" }} />
                {website.isWordPress ? "WordPress" : "Non-WordPress"}
              </span>
            )}
          </div>

          {website.tags && website.tags.length > 0 && (
            <div className="website-tags">
              <h3>Tags</h3>
              <div className="tags">
                {website.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="website-actions">
          <button className="action-btn primary" onClick={() => onCheck(website.id)} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} style={{ marginRight: "0.5rem" }} />
            {loading ? "Checking..." : "Check Status"}
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onTakeScreenshot(website.id)}
            disabled={screenshotLoading}
          >
            <Camera size={16} className={screenshotLoading ? "animate-spin" : ""} style={{ marginRight: "0.5rem" }} />
            {screenshotLoading ? "Capturing..." : "Take Screenshot"}
          </button>
        </div>

        {website.screenshot && (
          <div className="screenshot-section">
            <h3>
              <Eye size={18} style={{ marginRight: "0.5rem" }} />
              Website Preview
            </h3>
            <div className="screenshot-container-horizontal">
              <img
                src={website.screenshot || "/placeholder.svg"}
                alt={`Screenshot of ${website.name}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/generic-website-screenshot.png"
                }}
              />
            </div>
          </div>
        )}

        {website.vitals && (
          <div className="vitals-section">
            <h3>
              <Activity size={18} style={{ marginRight: "0.5rem" }} />
              Performance Metrics
            </h3>
            <div className="vitals-grid">
              <div className="vital-item">
                <span className="vital-label">LCP</span>
                <span className="vital-value">{website.vitals.lcp}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">FID</span>
                <span className="vital-value">{website.vitals.fid}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">CLS</span>
                <span className="vital-value">{website.vitals.cls}</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">FCP</span>
                <span className="vital-value">{website.vitals.fcp}ms</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">TTFB</span>
                <span className="vital-value">{website.vitals.ttfb}ms</span>
              </div>
            </div>
          </div>
        )}

        {website.wpscanResult && (
          <div className="security-section">
            <h3>
              <Shield size={18} style={{ marginRight: "0.5rem" }} />
              Security Scan Results
            </h3>
            <div className="scan-summary">
              <div className="scan-item">
                <span>
                  <AlertTriangle size={14} style={{ marginRight: "0.5rem" }} />
                  Vulnerabilities:
                </span>
                <span className={`count ${website.wpscanResult.vulnerabilities.length > 0 ? "danger" : "safe"}`}>
                  {website.wpscanResult.vulnerabilities.length}
                </span>
              </div>
              <div className="scan-item">
                <span>
                  <Puzzle size={14} style={{ marginRight: "0.5rem" }} />
                  Plugins:
                </span>
                <span className="count">{website.wpscanResult.plugins.length}</span>
              </div>
              <div className="scan-item">
                <span>
                  <Eye size={14} style={{ marginRight: "0.5rem" }} />
                  Themes:
                </span>
                <span className="count">{website.wpscanResult.themes.length}</span>
              </div>
              <div className="scan-item">
                <span>
                  <Users size={14} style={{ marginRight: "0.5rem" }} />
                  Users:
                </span>
                <span className="count">{website.wpscanResult.users.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WebsiteDetail
