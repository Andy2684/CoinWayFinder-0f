-- Create news_articles table with proper indexes and constraints
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    url VARCHAR(1000) NOT NULL UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sentiment_score DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    impact_score INTEGER DEFAULT 5 CHECK (impact_score >= 1 AND impact_score <= 10),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_score ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_title_search ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_content_search ON news_articles USING GIN(to_tsvector('english', content));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
    'Bitcoin surged to unprecedented levels as major corporations announce treasury allocations and ETF approvals drive institutional demand.',
    'Bitcoin has reached a new all-time high of $73,000, driven by unprecedented institutional adoption and regulatory clarity. Major corporations including MicroStrategy and Tesla have announced significant treasury allocations to Bitcoin, while the approval of multiple Bitcoin ETFs has opened the floodgates for institutional investment. Market analysts predict continued growth as traditional finance embraces digital assets.',
    'CryptoNews Daily',
    'https://example.com/bitcoin-ath-1',
    NOW() - INTERVAL '2 hours',
    0.8,
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'ETF']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Levels',
    'Ethereum validators are earning unprecedented rewards as network activity surges and staking participation reaches new milestones.',
    'Ethereum 2.0 validators are experiencing record-high staking rewards as network activity continues to surge. With over 32 million ETH now staked, representing nearly 27% of the total supply, validators are earning annual yields of up to 8.5%. The increased activity is attributed to growing DeFi adoption and the upcoming Shanghai upgrade.',
    'DeFi Pulse',
    'https://example.com/eth-staking-1',
    NOW() - INTERVAL '4 hours',
    0.6,
    7,
    ARRAY['Ethereum', 'Staking', 'DeFi', 'Rewards']
),
(
    'Major Exchange Hack Results in $100M Loss',
    'A sophisticated attack on a major cryptocurrency exchange has resulted in significant losses, raising concerns about security practices.',
    'A major cryptocurrency exchange suffered a devastating hack resulting in the loss of over $100 million in various digital assets. The attack, which appears to have exploited a vulnerability in the exchange''s hot wallet infrastructure, has prompted an immediate halt to all trading activities. The exchange has assured users that cold storage funds remain secure and has initiated a comprehensive security audit.',
    'Blockchain Security',
    'https://example.com/exchange-hack-1',
    NOW() - INTERVAL '6 hours',
    -0.9,
    8,
    ARRAY['Security', 'Hack', 'Exchange', 'Risk']
),
(
    'Central Bank Digital Currency Pilot Program Launches',
    'A major central bank has announced the launch of its digital currency pilot program, marking a significant step toward mainstream adoption.',
    'The Federal Reserve has officially launched its Central Bank Digital Currency (CBDC) pilot program, partnering with select financial institutions to test digital dollar transactions. The six-month pilot will evaluate the feasibility, security, and economic impact of a digital dollar. This development represents a significant step toward the mainstream adoption of digital currencies by traditional financial institutions.',
    'Financial Times Crypto',
    'https://example.com/cbdc-pilot-1',
    NOW() - INTERVAL '8 hours',
    0.4,
    8,
    ARRAY['CBDC', 'Federal Reserve', 'Digital Dollar', 'Regulation']
),
(
    'NFT Market Shows Signs of Recovery',
    'After months of decline, the NFT market is showing renewed interest with increased trading volumes and new project launches.',
    'The NFT market is experiencing a resurgence after months of declining activity. Trading volumes have increased by 45% over the past week, driven by new utility-focused projects and renewed interest from collectors. Major platforms report increased user engagement and several high-profile collections have seen significant price appreciation.',
    'NFT Insider',
    'https://example.com/nft-recovery-1',
    NOW() - INTERVAL '10 hours',
    0.5,
    5,
    ARRAY['NFT', 'Recovery', 'Trading', 'Collections']
),
(
    'DeFi Protocol Introduces Revolutionary Yield Farming',
    'A new DeFi protocol has launched with innovative yield farming mechanisms that promise higher returns with reduced risk.',
    'DeFiMax, a new decentralized finance protocol, has introduced a revolutionary yield farming mechanism that uses advanced algorithms to optimize returns while minimizing impermanent loss. The protocol''s unique approach to liquidity provision has attracted over $50 million in total value locked within its first week of launch.',
    'DeFi Weekly',
    'https://example.com/defi-yield-1',
    NOW() - INTERVAL '12 hours',
    0.7,
    6,
    ARRAY['DeFi', 'Yield Farming', 'Innovation', 'TVL']
),
(
    'Regulatory Clarity Boosts Crypto Market Confidence',
    'New regulatory guidelines provide much-needed clarity for cryptocurrency operations, boosting market confidence and institutional adoption.',
    'The Securities and Exchange Commission has released comprehensive guidelines for cryptocurrency operations, providing the regulatory clarity that the industry has long sought. The guidelines establish clear frameworks for token classification, exchange operations, and institutional custody services. Market participants have responded positively, with several major announcements expected in the coming weeks.',
    'Regulatory Watch',
    'https://example.com/regulatory-clarity-1',
    NOW() - INTERVAL '14 hours',
    0.8,
    9,
    ARRAY['Regulation', 'SEC', 'Clarity', 'Institutional']
),
(
    'Layer 2 Solutions See Massive Adoption Growth',
    'Ethereum Layer 2 solutions are experiencing unprecedented growth as users seek faster and cheaper transaction alternatives.',
    'Ethereum Layer 2 solutions have seen explosive growth, with total value locked increasing by over 200% in the past month. Arbitrum and Optimism lead the charge, processing millions of transactions daily at a fraction of mainnet costs. The growth is attributed to improved user experience and the migration of major DeFi protocols to Layer 2 networks.',
    'Layer 2 Analytics',
    'https://example.com/layer2-growth-1',
    NOW() - INTERVAL '16 hours',
    0.9,
    7,
    ARRAY['Layer 2', 'Ethereum', 'Scaling', 'Arbitrum']
)
ON CONFLICT (url) DO NOTHING;

-- Create a view for easy querying with formatted data
CREATE OR REPLACE VIEW news_articles_view AS
SELECT 
    id,
    title,
    summary,
    content,
    source,
    url,
    published_at,
    sentiment_score,
    impact_score,
    tags,
    CASE 
        WHEN sentiment_score > 0.2 THEN 'positive'
        WHEN sentiment_score < -0.2 THEN 'negative'
        ELSE 'neutral'
    END as sentiment_label,
    CASE 
        WHEN impact_score >= 8 THEN 'high'
        WHEN impact_score >= 6 THEN 'medium'
        ELSE 'low'
    END as impact_label,
    created_at,
    updated_at
FROM news_articles
ORDER BY published_at DESC;
