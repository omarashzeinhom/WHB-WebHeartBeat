// components/notes/ReportTab.tsx
import React from 'react';
import { WebsiteReport } from '../../models/website';

interface ReportTabProps {
    report: WebsiteReport;
    onUpdate: (report: WebsiteReport) => void;
}

export const ReportTab: React.FC<ReportTabProps> = ({
    report,
    onUpdate
}) => {
    const updateField = (field: keyof WebsiteReport, value: string) => {
        onUpdate({
            ...report,
            [field]: value
        });
    };

    const exportReport = (format: 'pdf' | 'json') => {
        if (format === 'json') {
            const timestamp = new Date().toISOString();
            const reportData = {
                ...report,
                exportDate: timestamp,
                format: 'json'
            };

            const dataStr = JSON.stringify(reportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `website-report-${timestamp.split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } else {
            alert('PDF export feature will be implemented. For now, use the JSON export.');
        }
    };

    return (
        <div className="notes-tab-content">
            <div className="tab-header">
                <h3>Website Status Report</h3>
                <div className="report-actions">
                    <button className="export-btn" onClick={() => exportReport('pdf')}>
                        Export as PDF
                    </button>
                    <button className="export-btn" onClick={() => exportReport('json')}>
                        Export as JSON
                    </button>
                </div>
            </div>

            <div className="report-fields">
                <div className="report-field">
                    <label>Executive Summary</label>
                    <textarea
                        value={report.summary}
                        onChange={(e) => updateField('summary', e.target.value)}
                        placeholder="Brief overview of website status..."
                        rows={3}
                    />
                </div>
                <div className="report-field">
                    <label>Performance Analysis</label>
                    <textarea
                        value={report.performance}
                        onChange={(e) => updateField('performance', e.target.value)}
                        placeholder="Performance metrics and analysis..."
                        rows={3}
                    />
                </div>
                <div className="report-field">
                    <label>Security Assessment</label>
                    <textarea
                        value={report.security}
                        onChange={(e) => updateField('security', e.target.value)}
                        placeholder="Security findings and recommendations..."
                        rows={3}
                    />
                </div>
                <div className="report-field">
                    <label>Recommendations</label>
                    <textarea
                        value={report.recommendations}
                        onChange={(e) => updateField('recommendations', e.target.value)}
                        placeholder="Action items and recommendations..."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};