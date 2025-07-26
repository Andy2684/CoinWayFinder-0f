-- Create trading_bots table with AI support
CREATE TABLE IF NOT EXISTS trading_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    strategy VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'stopped' CHECK (status IN ('active', 'paused', 'stopped', 'training')),
    config JSONB DEFAULT '{}',
    ai_config JSONB DEFAULT '{}',
    investment DECIMAL(15,2) DEFAULT 0,
    pnl DECIMAL(15,2) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    last_trade_at TIMESTAMP,
    
    -- AI-specific metrics
    ai_confidence DECIMAL(5,2) DEFAULT 0,
    learning_progress DECIMAL(5,2) DEFAULT 0,
    adaptation_rate DECIMAL(5,2) DEFAULT 0,
    prediction_accuracy DECIMAL(5,2) DEFAULT 0,
    
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_bots_user ON trading_bots(created_by);
CREATE INDEX IF NOT EXISTS idx_trading_bots_status ON trading_bots(status);
CREATE INDEX IF NOT EXISTS idx_trading_bots_strategy ON trading_bots(strategy);
CREATE INDEX IF NOT EXISTS idx_trading_bots_symbol ON trading_bots(symbol);

-- Create bot_training_jobs table for AI training tracking
CREATE TABLE IF NOT EXISTS bot_training_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress DECIMAL(5,2) DEFAULT 0,
    config JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_training_jobs_bot ON bot_training_jobs(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_training_jobs_status ON bot_training_jobs(status);

-- Create bot_performance_metrics table for detailed analytics
CREATE TABLE IF NOT EXISTS bot_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pnl DECIMAL(15,2) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    max_drawdown DECIMAL(5,2) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    volatility DECIMAL(8,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(bot_id, date)
);

CREATE INDEX IF NOT EXISTS idx_bot_performance_bot_date ON bot_performance_metrics(bot_id, date);

-- Create bot_signals table for tracking trading signals
CREATE TABLE IF NOT EXISTS bot_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES trading_bots(id) ON DELETE CASCADE,
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(15,8) NOT NULL,
    confidence DECIMAL(5,2) DEFAULT 0,
    reasoning TEXT,
    executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_signals_bot ON bot_signals(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_signals_symbol ON bot_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_bot_signals_created ON bot_signals(created_at);

-- Update trade_history table to include bot_id if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_history' AND column_name = 'bot_id') THEN
        ALTER TABLE trade_history ADD COLUMN bot_id UUID REFERENCES trading_bots(id) ON DELETE SET NULL;
        CREATE INDEX idx_trade_history_bot ON trade_history(bot_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_history' AND column_name = 'pnl') THEN
        ALTER TABLE trade_history ADD COLUMN pnl DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Create bot_backtests table for storing backtest results
CREATE TABLE IF NOT EXISTS bot_backtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    strategy VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    config JSONB DEFAULT '{}',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2) NOT NULL,
    
    -- Results
    total_return DECIMAL(15,2) DEFAULT 0,
    total_return_percent DECIMAL(8,4) DEFAULT 0,
    annualized_return DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(8,4) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    profit_factor DECIMAL(8,4) DEFAULT 0,
    
    results JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_backtests_user ON bot_backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_backtests_strategy ON bot_backtests(strategy);
CREATE INDEX IF NOT EXISTS idx_bot_backtests_symbol ON bot_backtests(symbol);
