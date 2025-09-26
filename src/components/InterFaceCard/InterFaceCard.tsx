import type React from "react"
import './InterFaceCard.css';

interface EarningsCardProps {
  totalExpense: number
  amount: string
  profitPercentage: number
  progressPercentage: number
  theme?: "light" | "dark"
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  amount,
  profitPercentage,
  progressPercentage,
  theme = "dark",
}) => {
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  return (
    <div className={`earnings-card ${theme}`} data-theme={theme}>
      <div className="card-stack">
        <div className="card card-back-3"></div>
        <div className="card card-back-2"></div>
        <div className="card card-back-1"></div>
        <div className="card card-front">
          <div className="card-content">
            <div className="header-section">
              <h3 className="title">Earnings</h3>
              <p className="subtitle">Total Expense</p>
            </div>

            <div className="amount-section">
              <span className="amount">{amount}</span>
            </div>

            <div className="profit-section">
              <p className="profit-text">
                Profit is <span className="profit-percentage">{profitPercentage}%</span> More than last Month
              </p>
            </div>

            <div className="progress-section">
              <div className="progress-container">
                <svg className="progress-ring" width="120" height="120">
                  <circle
                    className="progress-ring-background"
                    cx="60"
                    cy="60"
                    r="45"
                    fill="transparent"
                    stroke="var(--progress-bg)"
                    strokeWidth="8"
                  />
                  <circle
                    className="progress-ring-progress"
                    cx="60"
                    cy="60"
                    r="45"
                    fill="transparent"
                    stroke="var(--progress-fill)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-text">
                  <span className="progress-percentage">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
