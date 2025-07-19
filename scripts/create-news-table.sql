-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    url VARCHAR(1000) UNIQUE,
    image_url VARCHAR(1000),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
    tags TEXT[], -- PostgreSQL array for tags
    category VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news_articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_news_search ON news_articles USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || content)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO news_articles (
    title, summary, content, source, author, published_at, url, image_url, 
    sentiment, impact_score, tags, category
) VALUES 
(
    'Bitcoin Reaches New All-Time High Above $75,000',
    'Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.',
    'Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency''s journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence.',
    'CryptoNews',
    'Sarah Johnson',
    NOW() - INTERVAL '2 hours',
    'https://example.com/bitcoin-ath',
    '/placeholder.svg?height=200&width=400&text=Bitcoin+ATH',
    'positive',
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bullish'],
    'Market'
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Levels',
    'Ethereum staking yields reach new highs as network activity surges post-merge.',
    'Ethereum 2.0 staking rewards have reached record levels, with validators earning higher yields than ever before. The increased activity on the Ethereum network, combined with the successful transition to Proof of Stake, has created favorable conditions for stakers. Network fees and MEV rewards have contributed to the enhanced staking yields.',
    'EthereumDaily',
    'Michael Chen',
    NOW() - INTERVAL '4 hours',
    'https://example.com/eth-staking',
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking',
    'positive',
    7,
    ARRAY['Ethereum', 'Staking', 'DeFi', 'Yield'],
    'Technology'
),
(
    'Major DeFi Protocol Suffers $50M Exploit',
    'A popular DeFi lending protocol lost $50 million in a sophisticated smart contract attack.',
    'A major DeFi lending protocol has suffered a $50 million exploit due to a vulnerability in its smart contract code. The attack involved a complex flash loan manipulation that drained funds from the protocol''s liquidity pools. The team has paused the protocol and is working with security firms to investigate the incident.',
    'DeFiWatch',
    'Alex Rodriguez',
    NOW() - INTERVAL '6 hours',
    'https://example.com/defi-exploit',
    '/placeholder.svg?height=200&width=400&text=DeFi+Exploit',
    'negative',
    8,
    ARRAY['DeFi', 'Security', 'Exploit', 'Flash Loan'],
    'Security'
),
(
    'Central Bank Digital Currency Pilot Launches',
    'Major economy launches CBDC pilot program with retail and institutional participants.',
    'A major central bank has officially launched its Central Bank Digital Currency (CBDC) pilot program, involving both retail and institutional participants. The pilot will test various use cases including cross-border payments, retail transactions, and programmable money features. This represents a significant step toward mainstream digital currency adoption.',
    'FinanceToday',
    'Emma Thompson',
    NOW() - INTERVAL '8 hours',
    'https://example.com/cbdc-pilot',
    '/placeholder.svg?height=200&width=400&text=CBDC+Launch',
    'neutral',
    6,
    ARRAY['CBDC', 'Central Bank', 'Digital Currency', 'Pilot'],
    'Regulation'
),
(
    'NFT Market Shows Signs of Recovery',
    'NFT trading volumes increase 40% as new utility-focused projects gain traction.',
    'The NFT market is showing signs of recovery with trading volumes increasing by 40% over the past month. New utility-focused NFT projects are gaining traction, moving beyond simple profile pictures to offer real-world benefits and integration with DeFi protocols. Gaming NFTs and metaverse assets are leading the recovery.',
    'NFTInsider',
    'David Kim',
    NOW() - INTERVAL '12 hours',
    'https://example.com/nft-recovery',
    '/placeholder.svg?height=200&width=400&text=NFT+Recovery',
    'positive',
    5,
    ARRAY['NFT', 'Recovery', 'Gaming', 'Utility'],
    'Market'
),
(
    'Regulatory Clarity Boosts Crypto Adoption',
    'New regulatory framework provides clear guidelines for crypto businesses and investors.',
    'New regulatory guidelines have provided much-needed clarity for the cryptocurrency industry. The comprehensive framework addresses key areas including custody, trading, and taxation of digital assets. Industry leaders praise the balanced approach that promotes innovation while ensuring consumer protection.',
    'RegulatoryNews',
    'Jennifer Walsh',
    NOW() - INTERVAL '18 hours',
    'https://example.com/crypto-regulation',
    '/placeholder.svg?height=200&width=400&text=Crypto+Regulation',
    'positive',
    8,
    ARRAY['Regulation', 'Compliance', 'Adoption', 'Framework'],
    'Regulation'
),
(
    'Layer 2 Solutions See Massive Growth',
    'Ethereum Layer 2 networks process record transaction volumes as fees remain low.',
    'Ethereum Layer 2 solutions have processed record transaction volumes while maintaining low fees. Optimistic rollups and zk-rollups are seeing increased adoption from both users and developers. The growth in Layer 2 activity demonstrates the success of Ethereum''s scaling roadmap.',
    'Layer2Daily',
    'Robert Chang',
    NOW() - INTERVAL '24 hours',
    'https://example.com/layer2-growth',
    '/placeholder.svg?height=200&width=400&text=Layer+2+Growth',
    'positive',
    6,
    ARRAY['Layer 2', 'Scaling', 'Ethereum', 'Rollups'],
    'Technology'
),
(
    'Crypto Market Volatility Concerns Investors',
    'High volatility in crypto markets raises concerns about institutional adoption pace.',
    'Recent high volatility in cryptocurrency markets has raised concerns among institutional investors about the pace of adoption. While long-term fundamentals remain strong, short-term price swings continue to challenge risk management strategies. Analysts suggest that market maturity will eventually reduce volatility.',
    'MarketAnalysis',
    'Lisa Park',
    NOW() - INTERVAL '30 hours',
    'https://example.com/market-volatility',
    '/placeholder.svg?height=200&width=400&text=Market+Volatility',
    'negative',
    4,
    ARRAY['Volatility', 'Institutional', 'Risk', 'Markets'],
    'Market'
);

-- Create view for featured articles
CREATE OR REPLACE VIEW featured_news AS
SELECT * FROM news_articles 
WHERE is_featured = TRUE 
ORDER BY published_at DESC;

-- Create view for recent high-impact news
CREATE OR REPLACE VIEW high_impact_news AS
SELECT * FROM news_articles 
WHERE impact_score >= 7 
AND published_at >= NOW() - INTERVAL '7 days'
ORDER BY impact_score DESC, published_at DESC;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_news(search_query TEXT)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    source VARCHAR(100),
    author VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE,
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    sentiment VARCHAR(20),
    impact_score INTEGER,
    tags TEXT[],
    category VARCHAR(50),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id, n.title, n.summary, n.content, n.source, n.author,
        n.published_at, n.url, n.image_url, n.sentiment, n.impact_score,
        n.tags, n.category,
        ts_rank(to_tsvector('english', n.title || ' ' || COALESCE(n.summary, '') || ' ' || n.content), 
                plainto_tsquery('english', search_query)) as rank
    FROM news_articles n
    WHERE to_tsvector('english', n.title || ' ' || COALESCE(n.summary, '') || ' ' || n.content) 
          @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, n.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE news_articles_id_seq TO your_app_user;
