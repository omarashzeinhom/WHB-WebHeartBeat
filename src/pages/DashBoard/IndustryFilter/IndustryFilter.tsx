// components/IndustryFilter/IndustryFilter.tsx
import type React from "react"
import { useRef, useState, useEffect } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Globe,
  ShoppingCart,
  DollarSign,
  Heart,
  GraduationCap,
  Monitor,
  Newspaper,
  Plane,
  Building,
  HandHeart,
  Circle
} from "lucide-react"
import type { Industry } from "../../../models/website"
import "./IndustryFilter.css"

interface IndustryFilterProps {
  selectedIndustry: Industry | "all"
  onIndustryChange: (industry: Industry | "all") => void
}

const industries: { value: Industry | "all"; label: string; icon: React.ComponentType<any> }[] = [
  { value: "all", label: "All Websites", icon: Globe },
  { value: "ecommerce", label: "E-Commerce", icon: ShoppingCart },
  { value: "finance", label: "Finance", icon: DollarSign },
  { value: "healthcare", label: "Healthcare", icon: Heart },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "technology", label: "Technology", icon: Monitor },
  { value: "media", label: "Media", icon: Newspaper },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "government", label: "Government", icon: Building },
  { value: "nonprofit", label: "Non-Profit", icon: HandHeart },
  { value: "general", label: "General", icon: Circle },
]

const IndustryFilter: React.FC<IndustryFilterProps> = ({ selectedIndustry, onIndustryChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Check scroll availability
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollability)
      window.addEventListener("resize", checkScrollability)
      return () => {
        container.removeEventListener("scroll", checkScrollability)
        window.removeEventListener("resize", checkScrollability)
      }
    }
  }, [])

  // Scroll functions
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = "grabbing"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab"
    }
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const clearAll = () => {
    onIndustryChange("all")
  }

  const getSelectedText = () => {
    if (selectedIndustry === "all") return "All Websites"
    const industry = industries.find(ind => ind.value === selectedIndustry)
    return industry?.label || selectedIndustry
  }

  return (
    <div className="industry-filter">
      <div className="industry-filter-header">
        <h3 className="industry-filter-title">Filter by Industry</h3>
        <div className="industry-filter-controls">
          <span className="industry-selected-status">Selected: {getSelectedText()}</span>
          {selectedIndustry !== "all" && (
            <button onClick={clearAll} className="industry-clear-all">
              Clear selection
            </button>
          )}
        </div>
      </div>

      <div className="industry-scroll-container">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="industry-scroll-btn industry-scroll-left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="industry-scroll-btn industry-scroll-right"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Industry pills container */}
        <div
          ref={scrollContainerRef}
          className="industry-pills-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {industries.map((industry) => {
            const isSelected = selectedIndustry === industry.value
            const IconComponent = industry.icon
            return (
              <button
                key={industry.value}
                onClick={() => onIndustryChange(industry.value)}
                className={`industry-pill ${isSelected ? "industry-pill-active" : ""}`}
                title={industry.label}
              >
                <IconComponent className="industry-pill-icon" size={18} />
                <span className="industry-pill-label">{industry.label}</span>
              </button>
            )
          })}
        </div>

        {/* Gradient fade indicators */}
        <div className="industry-fade industry-fade-left" />
        <div className="industry-fade industry-fade-right" />
      </div>
    </div>
  )
}

export default IndustryFilter