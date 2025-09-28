import React, { useState } from 'react';
import { 
  FileDown, 
  Camera, 
  FileText, 
  Table, 
  Image,
  Globe,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';

const EnhancedExportSystem = () => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json' | 'screenshot'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Mock website data for demonstration
  const mockWebsites = [
    {
      id: 1,
      name: "Example Commerce Site",
      url: "https://example-ecommerce.com",
      status: 200,
      industry: "ecommerce",
      projectStatus: "building",
      lastChecked: "2025-01-20T10:30:00Z",
      isWordPress: true,
      vitals: { lcp: 2200, fid: 85, cls: 0.12, fcp: 1500, ttfb: 650 },
      wpscanResult: {
        vulnerabilities: [
          { severity: "medium", title: "Outdated Plugin Version", description: "Contact Form 7 needs updating" }
        ],
        plugins: 8,
        themes: 1,
        users: 3
      },
      favorite: true
    },
    {
      id: 2,
      name: "Healthcare Portal",
      url: "https://healthcare-portal.com", 
      status: 200,
      industry: "healthcare",
      projectStatus: "client_access",
      lastChecked: "2025-01-20T09:15:00Z",
      isWordPress: false,
      vitals: { lcp: 1800, fid: 45, cls: 0.08, fcp: 1200, ttfb: 400 },
      favorite: false
    },
    {
      id: 3,
      name: "Finance Dashboard",
      url: "https://finance-dash.com",
      status: 404,
      industry: "finance", 
      projectStatus: "wip",
      lastChecked: "2025-01-20T08:45:00Z",
      isWordPress: false,
      vitals: null,
      favorite: false
    }
  ];

  const generateReport = () => {
    const totalWebsites = mockWebsites.length;
    const onlineWebsites = mockWebsites.filter(w => w.status === 200).length;
    const wordpressCount = mockWebsites.filter(w => w.isWordPress).length;
    const avgPerformance = mockWebsites
      .filter(w => w.vitals)
      .reduce((acc, w) => ({
        lcp: acc.lcp + w.vitals.lcp,
        fid: acc.fid + w.vitals.fid,
        cls: acc.cls + w.vitals.cls,
        fcp: acc.fcp + w.vitals.fcp,
        ttfb: acc.ttfb + w.vitals.ttfb,
        count: acc.count + 1
      }), { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 });

    if (avgPerformance.count > 0) {
      avgPerformance.lcp = Math.round(avgPerformance.lcp / avgPerformance.count);
      avgPerformance.fid = Math.round(avgPerformance.fid / avgPerformance.count);
      avgPerformance.cls = Math.round((avgPerformance.cls / avgPerformance.count) * 100) / 100;
      avgPerformance.fcp = Math.round(avgPerformance.fcp / avgPerformance.count);
      avgPerformance.ttfb = Math.round(avgPerformance.ttfb / avgPerformance.count);
    }

    const securitySummary = mockWebsites.reduce((acc, w) => {
      if (w.wpscanResult) {
        acc.scannedSites++;
        acc.totalVulns += w.wpscanResult.vulnerabilities.length;
        acc.criticalVulns += w.wpscanResult.vulnerabilities.filter(v => v.severity === 'critical').length;
      }
      return acc;
    }, { scannedSites: 0, totalVulns: 0, criticalVulns: 0 });

    return {
      summary: {
        totalWebsites,
        onlineWebsites,
        uptime: Math.round((onlineWebsites / totalWebsites) * 100),
        wordpressCount
      },
      performance: avgPerformance.count > 0 ? avgPerformance : null,
      security: securitySummary,
      websites: mockWebsites,
      generatedAt: new Date().toISOString()
    };
  };

  const exportAsJSON = (data: any) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (data: any) => {
    const headers = ['Name', 'URL', 'Status', 'Industry', 'Project Status', 'Last Checked', 'WordPress', 'LCP (ms)', 'FID (ms)', 'CLS', 'Vulnerabilities'];
    const rows = data.websites.map((w: any) => [
      w.name,
      w.url,
      w.status || 'Unknown',
      w.industry,
      w.projectStatus,
      w.lastChecked ? new Date(w.lastChecked).toLocaleDateString() : 'Never',
      w.isWordPress ? 'Yes' : 'No',
      w.vitals?.lcp || 'N/A',
      w.vitals?.fid || 'N/A', 
      w.vitals?.cls || 'N/A',
      w.wpscanResult?.vulnerabilities.length || '0'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = (data: any) => {
    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Website Health Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #4CAF50; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .metric-card { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            border-left: 4px solid #4CAF50;
          }
          .metric-value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #4CAF50;
          }
          .metric-label { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          .website-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          .website-table th, .website-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
          }
          .website-table th { 
            background: #4CAF50; 
            color: white;
          }
          .status-online { color: #28a745; font-weight: bold; }
          .status-offline { color: #dc3545; font-weight: bold; }
          .performance-section { 
            margin-top: 30px; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
          }
          .security-section { 
            margin-top: 30px; 
            background: #fff3cd; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #ffc107;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #ddd; 
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Website Health Report</h1>
          <p>Generated on ${new Date(data.generatedAt).toLocaleDateString()} at ${new Date(data.generatedAt).toLocaleTimeString()}</p>
        </div>

        <div class="summary-grid">
          <div class="metric-card">
            <div class="metric-value">${data.summary.totalWebsites}</div>
            <div class="metric-label">Total Websites</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.summary.uptime}%</div>
            <div class="metric-label">Uptime</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.summary.wordpressCount}</div>
            <div class="metric-label">WordPress Sites</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.security.totalVulns}</div>
            <div class="metric-label">Total Vulnerabilities</div>
          </div>
        </div>

        ${data.performance ? `
        <div class="performance-section">
          <h2>Performance Analytics</h2>
          <div class="summary-grid">
            <div class="metric-card">
              <div class="metric-value">${data.performance.lcp}ms</div>
              <div class="metric-label">Avg LCP</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.performance.fid}ms</div>
              <div class="metric-label">Avg FID</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.performance.cls}</div>
              <div class="metric-label">Avg CLS</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.performance.ttfb}ms</div>
              <div class="metric-label">Avg TTFB</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="security-section">
          <h2>Security Overview</h2>
          <p>
            <strong>Scanned Websites:</strong> ${data.security.scannedSites} of ${data.summary.totalWebsites}<br>
            <strong>Total Vulnerabilities:</strong> ${data.security.totalVulns}<br>
            <strong>Critical Vulnerabilities:</strong> ${data.security.criticalVulns}
          </p>
        </div>

        <h2>Website Details</h2>
        <table class="website-table">
          <thead>
            <tr>
              <th>Website</th>
              <th>Status</th>
              <th>Industry</th>
              <th>Project Status</th>
              <th>Last Checked</th>
              <th>WordPress</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${data.websites.map((w: any) => `
              <tr>
                <td>
                  <strong>${w.name}</strong><br>
                  <small>${w.url}</small>
                </td>
                <td class="${w.status === 200 ? 'status-online' : 'status-offline'}">
                  ${w.status || 'Unknown'}
                </td>
                <td>${w.industry}</td>
                <td>${w.projectStatus}</td>
                <td>${w.lastChecked ? new Date(w.lastChecked).toLocaleDateString() : 'Never'}</td>
                <td>${w.isWordPress ? 'Yes' : 'No'}</td>
                <td>
                  ${w.vitals ? `
                    LCP: ${w.vitals.lcp}ms<br>
                    FID: ${w.vitals.fid}ms<br>
                    CLS: ${w.vitals.cls}
                  ` : 'No data'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Report generated by WebHeartbeat - Website Health Monitoring Tool</p>
          <p>This report contains ${data.summary.totalWebsites} websites with a combined uptime of ${data.summary.uptime}%</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const takeFullPageScreenshot = async () => {
    try {
      // This would capture the entire report section
      const reportElement = document.querySelector('.export-report-container');
      if (!reportElement) return;

      // Using html2canvas (you'd need to install this package)
      // const canvas = await html2canvas(reportElement as HTMLElement);
      // const imgData = canvas.toDataURL('image/png');
      
      // For demo purposes, we'll simulate this
      console.log('Full page screenshot would be taken here');
      alert('Screenshot functionality would capture the entire report view. In a real implementation, this would use html2canvas or a similar library.');
      
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const data = generateReport();
    setReportData(data);

    try {
      switch (exportFormat) {
        case 'json':
          exportAsJSON(data);
          break;
        case 'csv':
          exportAsCSV(data);
          break;
        case 'pdf':
          exportAsPDF(data);
          break;
        case 'screenshot':
          await takeFullPageScreenshot();
          break;
        default:
          console.error('Unknown export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const data = reportData || generateReport();

  return (
    <div className="export-report-container" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Export Controls */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Export Website Report</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              value="pdf" 
              checked={exportFormat === 'pdf'} 
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            <FileText size={16} />
            PDF Report
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              value="csv" 
              checked={exportFormat === 'csv'} 
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            <Table size={16} />
            CSV Data
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              value="json" 
              checked={exportFormat === 'json'} 
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            <FileDown size={16} />
            JSON Export
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              value="screenshot" 
              checked={exportFormat === 'screenshot'} 
              onChange={(e) => setExportFormat(e.target.value as any)}
            />
            <Camera size={16} />
            Full Screenshot
          </label>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isExporting ? 0.6 : 1
            }}
          >
            {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          borderBottom: '3px solid #4CAF50', 
          paddingBottom: '20px', 
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: '0', color: '#333' }}>Website Health Report</h1>
          <p style={{ margin: '10px 0 0 0', color: '#666' }}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            borderLeft: '4px solid #4CAF50'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <Globe size={20} color="#4CAF50" />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                {data.summary.totalWebsites}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Websites</div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            borderLeft: '4px solid #28a745'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <CheckCircle size={20} color="#28a745" />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {data.summary.uptime}%
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Uptime</div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            borderLeft: '4px solid #007bff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <Users size={20} color="#007bff" />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {data.summary.wordpressCount}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>WordPress Sites</div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            borderLeft: '4px solid #ffc107'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <Shield size={20} color="#ffc107" />
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {data.security.totalVulns}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Vulnerabilities</div>
          </div>
        </div>

        {/* Performance Section */}
        {data.performance && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={24} color="#4CAF50" />
              Performance Analytics
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '15px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {data.performance.lcp}ms
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg LCP</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {data.performance.fid}ms
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg FID</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {data.performance.cls}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg CLS</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {data.performance.fcp}ms
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg FCP</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {data.performance.ttfb}ms
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg TTFB</div>
              </div>
            </div>
          </div>
        )}

        {/* Security Section */}
        <div style={{
          background: '#fff3cd',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107',
          marginBottom: '30px'
        }}>
          <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="#ffc107" />
            Security Overview
          </h2>
          <div style={{ lineHeight: '1.6' }}>
            <p><strong>Scanned Websites:</strong> {data.security.scannedSites} of {data.summary.totalWebsites}</p>
            <p><strong>Total Vulnerabilities:</strong> {data.security.totalVulns}</p>
            <p><strong>Critical Vulnerabilities:</strong> {data.security.criticalVulns}</p>
          </div>
        </div>

        {/* Website Table */}
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingUp size={24} color="#4CAF50" />
          Website Details
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Website</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Industry</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Project Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Last Checked</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.websites.map((website: any, index: number) => (
                <tr key={website.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <strong>{website.name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{website.url}</small>
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #eee',
                    color: website.status === 200 ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {website.status || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{website.industry}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{website.projectStatus}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {website.lastChecked ? new Date(website.lastChecked).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {website.vitals ? (
                      <div>
                        <div>LCP: {website.vitals.lcp}ms</div>
                        <div>FID: {website.vitals.fid}ms</div>
                        <div>CLS: {website.vitals.cls}</div>
                      </div>
                    ) : 'No data'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          borderTop: '1px solid #ddd',
          paddingTop: '20px'
        }}>
          <p>Report generated by WebHeartbeat - Website Health Monitoring Tool</p>
          <p>This report contains {data.summary.totalWebsites} websites with a combined uptime of {data.summary.uptime}%</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExportSystem;