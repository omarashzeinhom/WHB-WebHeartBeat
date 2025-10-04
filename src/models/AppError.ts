export interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}