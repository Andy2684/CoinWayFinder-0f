-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    url VARCHAR(1000),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment_score DECIMAL(3,2) DEFAULT 0.0,
    impact_score INTEGER DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    
    -- Indexes for better performance
    CONSTRAINT sentiment_score_range CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    CONSTRAINT impact_score_range CHECK (impact_score >= 1 AND impact_score <= 10)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_score ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_title_search ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_content_search ON news_articles USING GIN(to_tsvector('english', content));

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High Above $75,000',
    'Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.',
    'Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency''s journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence.',
    'CryptoNews',
    'https://example.com/bitcoin-ath',
    NOW() - INTERVAL '2 hours',
    0.8,
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Levels',
    'Ethereum validators are earning unprecedented rewards as network activity surges.',
    'Ethereum 2.0 validators are experiencing record-high staking rewards as network activity reaches new peaks. The combination of increased transaction fees and MEV rewards has made staking more attractive than ever. With over 32 million ETH now staked, the network''s security continues to strengthen.',
    'EthereumDaily',
    'https://example.com/eth-staking',
    NOW() - INTERVAL '4 hours',
    0.6,
    7,
    ARRAY['Ethereum', 'Staking', 'DeFi']
),
(
    'Major DeFi Protocol Suffers $50M Exploit',
    'A popular DeFi lending protocol has been exploited, resulting in significant losses.',
    'A major DeFi lending protocol has suffered a $50 million exploit due to a smart contract vulnerability. The attack involved a complex flash loan manipulation that drained funds from the protocol''s liquidity pools. The team has paused the protocol and is working with security firms to investigate the incident.',
    'DeFiWatch',
    'https://example.com/defi-exploit',
    NOW() - INTERVAL '6 hours',
    -0.7,
    8,
    ARRAY['DeFi', 'Security', 'Exploit']
),
(
    'Central Bank Digital Currency Pilot Program Launches',
    'A major central bank has launched a pilot program for its digital currency.',
    'The Federal Reserve has announced the launch of a pilot program for a Central Bank Digital Currency (CBDC). The program will test the feasibility and implications of a digital dollar in controlled environments. This development could significantly impact the cryptocurrency landscape and traditional banking systems.',
    'FinanceToday',
    'https://example.com/cbdc-pilot',
    NOW() - INTERVAL '8 hours',
    0.2,
    9,
    ARRAY['CBDC', 'Regulation', 'Government']
),
(
    'NFT Market Shows Signs of Recovery',
    'NFT trading volumes have increased significantly over the past week.',
    'The NFT market is showing signs of recovery with trading volumes increasing by 150% over the past week. Blue-chip collections are leading the recovery, with floor prices rising across major marketplaces. New utility-focused projects are gaining traction as the market matures beyond speculative trading.',
    'NFTInsider',
    'https://example.com/nft-recovery',
    NOW() - INTERVAL '12 hours',
    0.5,
    6,
    ARRAY['NFT', 'Recovery', 'Trading']
),
(
    'Layer 2 Solutions See Massive Adoption Growth',
    'Ethereum Layer 2 networks are experiencing unprecedented user growth.',
    'Ethereum Layer 2 solutions are experiencing massive adoption growth, with total value locked (TVL) reaching new highs. Arbitrum and Optimism lead the charge with improved user experience and lower transaction costs. The growth signals a maturing ecosystem that''s addressing Ethereum''s scalability challenges.',
    'Layer2News',
    'https://example.com/layer2-growth',
    NOW() - INTERVAL '16 hours',
    0.7,
    7,
    ARRAY['Layer2', 'Ethereum', 'Scaling']
),
(
    'Crypto Regulation Framework Proposed',
    'New comprehensive regulatory framework for cryptocurrencies has been proposed.',
    'Lawmakers have proposed a comprehensive regulatory framework for cryptocurrencies that aims to provide clarity while fostering innovation. The framework addresses key areas including stablecoin regulation, DeFi oversight, and consumer protection measures. Industry leaders have responded positively to the balanced approach.',
    'RegulatoryUpdate',
    'https://example.com/crypto-regulation',
    NOW() - INTERVAL '20 hours',
    0.3,
    8,
    ARRAY['Regulation', 'Policy', 'Government']
),
(
    'Institutional Crypto Custody Solutions Expand',
    'Major financial institutions are expanding their cryptocurrency custody offerings.',
    'Several major financial institutions have announced expansions to their cryptocurrency custody solutions, signaling growing institutional demand. The services now support a wider range of digital assets and offer enhanced security features. This development is expected to accelerate institutional adoption of cryptocurrencies.',
    'InstitutionalCrypto',
    'https://example.com/custody-expansion',
    NOW() - INTERVAL '24 hours',
    0.6,
    7,
    ARRAY['Institutional', 'Custody', 'Adoption']
)
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
