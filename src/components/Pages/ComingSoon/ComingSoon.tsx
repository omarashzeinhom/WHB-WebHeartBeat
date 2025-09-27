// components/Pages/ComingSoon/ComingSoon.tsx
import React from 'react';
import { Construction, Calendar } from 'lucide-react';

interface ComingSoonProps {
  pageName: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => {
  const formatPageName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-content">
        <Construction size={64} className="coming-soon-icon" />
        <h1>{formatPageName(pageName)}</h1>
        <p>This feature is coming soon! We're working hard to bring you the best experience.</p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <Calendar size={20} />
            <span>Expected: Q2 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;