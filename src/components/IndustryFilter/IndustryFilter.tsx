// components/IndustryFilter/IndustryFilter.tsx - FIXED
import type React from "react"
import type { Industry } from "../../models/website"
import "./IndustryFilter.css"

interface IndustryFilterProps {
  selectedIndustry: Industry | "all"
  onIndustryChange: (industry: Industry | "all") => void
}

const industries: { value: Industry | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All Websites", icon: "🌐" },
  { value: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "media", label: "Media", icon: "📰" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "government", label: "Government", icon: "🏛️" },
  { value: "nonprofit", label: "Non-Profit", icon: "🤝" },
  { value: "general", label: "General", icon: "🌍" },
]

const IndustryFilter: React.FC<IndustryFilterProps> = ({ selectedIndustry, onIndustryChange }) => {
  return (
    <div className="industry-filter">
      <h3>Filter by Industry</h3>
      <div className="industry-buttons">
        {industries.map((industry) => (
          <button
            key={industry.value}
            className={`industry-btn ${selectedIndustry === industry.value ? "active" : ""}`}
            onClick={() => onIndustryChange(industry.value)}
            title={industry.label}
          >
            <span className="industry-icon">{industry.icon}</span>
            <span className="industry-label">{industry.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default IndustryFilter // Make sure this exports IndustryFilter, not IndustryFilterPills