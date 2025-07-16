export interface MainNavItem {
  title: string
  href: string
  disabled?: boolean
}

export interface SidebarNavItem {
  title: string
  href: string
  icon: any
  disabled?: boolean
}

export interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export interface Signal {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  price: number
  targetPrice: number
  stopLoss: number
  confidence: number
  timeframe: string
  exchange: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  pnl?: number
  analysis: string
}

export interface Bot {
  id: string
  name: string
  strategy: string
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED'
  pnl: number
  trades: number
  winRate: number
  createdAt: string
}

export interface Exchange {
  id: string
  name: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  apiKey?: string
  permissions: string[]
  lastSync: string
}
