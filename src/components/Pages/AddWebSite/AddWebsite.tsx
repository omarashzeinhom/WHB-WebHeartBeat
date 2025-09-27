import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Industry } from "../../../models/website";
import AddWebsiteForm from "../../AddWebsiteForm/AddWebsiteForm";
import { TauriService } from "../../../services/TauriService";
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2,
  ShoppingCart, 
  CreditCard, 
  Heart, 
  GraduationCap, 
  Cpu, 
  Globe,
  BarChart3
} from 'lucide-react';
import './AddWebsite.css';

interface AddWebsitePageProps {
  onWebsiteAdded?: (website: any) => void;
}

function AddWebsitePage({ onWebsiteAdded }: AddWebsitePageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addWebsite = async (url: string, industry: Industry = 'general') => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const websiteData = {
        id: Date.now(),
        url,
        name: new URL(url).hostname,
        vitals: null,
        status: null,
        lastChecked: null,
        industry: industry,
        favorite: false,
        screenshot: null
      };

      // Save the website using TauriService
      const currentWebsites = await TauriService.loadWebsites();
      const updatedWebsites = [...currentWebsites, websiteData];
      await TauriService.saveWebsites(updatedWebsites);

      // Call the callback if provided
      if (onWebsiteAdded) {
        onWebsiteAdded(websiteData);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate({ to: '/dashboard' as any });
      }, 2000);
      
    } catch (error) {
      console.error("Error adding website:", error);
      setError("Invalid URL provided or failed to save website");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/dashboard' as any });
  };

  return (
    <div className="add-website-page">
      <div className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleCancel}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="header-text">
            <div className="header-icon">
              <BarChart3 size={32} />
            </div>
            <h1>Add New Website</h1>
            <p>Monitor your website's performance and track vital metrics</p>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="form-section">
          {error && (
            <div className="error-message alert-message">
              <AlertCircle className="alert-icon" size={20} />
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="success-message alert-message">
              <CheckCircle2 className="alert-icon" size={20} />
              <div>
                <strong>Success!</strong>
                <p>Website added successfully! Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          <AddWebsiteForm onAdd={addWebsite} loading={loading} />
        </div>

        <div className="industries-section">
          <div className="industries-card">
            <div className="card-header">
              <Globe className="card-icon" size={24} />
              <h3>Industry Categorization</h3>
            </div>
            <p className="industries-description">
              Categorize your websites by industry to filter and analyze performance
              metrics specific to different sectors.
            </p>
            
            <div className="industries-grid">
              <div className="industry-item">
                <div className="industry-icon">
                  <ShoppingCart size={20} />
                </div>
                <div className="industry-content">
                  <strong>E-Commerce</strong>
                  <p>Focus on conversion metrics and page load times</p>
                </div>
              </div>
              
              <div className="industry-item">
                <div className="industry-icon">
                  <CreditCard size={20} />
                </div>
                <div className="industry-content">
                  <strong>Finance</strong>
                  <p>Emphasize security and compliance indicators</p>
                </div>
              </div>
              
              <div className="industry-item">
                <div className="industry-icon">
                  <Heart size={20} />
                </div>
                <div className="industry-content">
                  <strong>Healthcare</strong>
                  <p>Prioritize accessibility and reliability</p>
                </div>
              </div>
              
              <div className="industry-item">
                <div className="industry-icon">
                  <GraduationCap size={20} />
                </div>
                <div className="industry-content">
                  <strong>Education</strong>
                  <p>Focus on content delivery and engagement</p>
                </div>
              </div>
              
              <div className="industry-item">
                <div className="industry-icon">
                  <Cpu size={20} />
                </div>
                <div className="industry-content">
                  <strong>Technology</strong>
                  <p>Monitor advanced performance metrics</p>
                </div>
              </div>
              
              <div className="industry-item">
                <div className="industry-icon">
                  <Globe size={20} />
                </div>
                <div className="industry-content">
                  <strong>General</strong>
                  <p>Standard monitoring metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddWebsitePage;