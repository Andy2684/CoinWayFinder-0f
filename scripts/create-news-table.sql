-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    url VARCHAR(1000) UNIQUE NOT NULL,
    image_url VARCHAR(1000),
    category VARCHAR(50) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')) NOT NULL DEFAULT 'neutral',
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10) NOT NULL DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON news_articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news_articles(is_published) WHERE is_published = TRUE;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_news_search ON news_articles USING GIN (
    to_tsvector('english', title || ' ' || summary || ' ' || content || ' ' || array_to_string(tags, ' '))
);

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN (tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles 
    SET view_count = view_count + 1 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for published articles with calculated metrics
CREATE OR REPLACE VIEW published_news AS
SELECT 
    id,
    title,
    summary,
    content,
    source,
    author,
    published_at,
    created_at,
    updated_at,
    url,
    image_url,
    category,
    tags,
    sentiment,
    impact_score,
    view_count,
    is_featured,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/3600 AS hours_since_published,
    CASE 
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/3600 < 1 THEN 'Just now'
        WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/3600 < 24 THEN 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/3600 || 'h ago'
        ELSE 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/(3600*24) || 'd ago'
    END AS time_ago
FROM news_articles 
WHERE is_published = TRUE;

-- Insert sample news data
INSERT INTO news_articles (
    title, summary, content, source, author, published_at, url, image_url, 
    category, tags, sentiment, impact_score
) VALUES 
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin''s remarkable surge to new heights has been driven by unprecedented institutional adoption. Major corporations including MicroStrategy, Tesla, and Square have allocated significant portions of their treasury reserves to Bitcoin. The cryptocurrency''s limited supply of 21 million coins, combined with growing demand from institutional investors, has created a perfect storm for price appreciation. Market analysts predict this trend will continue as more Fortune 500 companies recognize Bitcoin as a legitimate store of value and hedge against inflation.',
    'CryptoDaily',
    'Sarah Johnson',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    'https://cryptodaily.com/bitcoin-ath-institutional-adoption',
    '/placeholder.svg?height=200&width=400&text=Bitcoin+Chart',
    'Market Analysis',
    ARRAY['Bitcoin', 'BTC', 'Institutional', 'ATH', 'Investment'],
    'positive',
    9
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Levels',
    'Ethereum validators are earning unprecedented rewards as network activity surges and staking participation reaches new milestones.',
    'The Ethereum network has seen a dramatic increase in staking rewards, with validators now earning an average of 8.5% APY. This surge is attributed to increased network activity, higher transaction fees, and the successful implementation of EIP-1559. The proof-of-stake consensus mechanism has proven to be both energy-efficient and profitable for participants. With over 18 million ETH now staked, representing approximately 15% of the total supply, the network''s security and decentralization continue to strengthen.',
    'EthereumInsider',
    'Michael Chen',
    CURRENT_TIMESTAMP - INTERVAL '4 hours',
    'https://ethereuminsider.com/eth2-staking-rewards-record',
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking',
    'DeFi',
    ARRAY['Ethereum', 'ETH', 'Staking', 'Rewards', 'PoS'],
    'positive',
    7
),
(
    'Major DeFi Protocol Suffers $50M Exploit',
    'A popular decentralized finance protocol has been exploited for $50 million due to a smart contract vulnerability.',
    'The DeFi space has been shaken by another major exploit, with hackers draining $50 million from a prominent lending protocol. The attack exploited a vulnerability in the protocol''s flash loan mechanism, allowing the attacker to manipulate price oracles and drain funds. This incident highlights the ongoing security challenges in the DeFi ecosystem, where complex smart contracts can contain subtle vulnerabilities. The protocol team has paused all operations and is working with security firms to investigate the breach and potentially recover funds.',
    'DeFiWatch',
    'Alex Rodriguez',
    CURRENT_TIMESTAMP - INTERVAL '6 hours',
    'https://defiwatch.com/major-protocol-exploit-50m',
    '/placeholder.svg?height=200&width=400&text=DeFi+Security',
    'Security',
    ARRAY['DeFi', 'Exploit', 'Security', 'Smart Contracts', 'Hack'],
    'negative',
    8
),
(
    'Central Bank Digital Currencies Gain Momentum Globally',
    'Multiple countries announce progress on their CBDC initiatives, with pilot programs showing promising results.',
    'Central Bank Digital Currencies (CBDCs) are gaining significant traction worldwide, with over 100 countries now exploring or developing their own digital currencies. China''s digital yuan has completed successful pilot programs in major cities, while the European Central Bank has advanced its digital euro project. The Bank of England and Federal Reserve are also conducting extensive research into CBDCs. These developments could reshape the global financial system, offering benefits such as improved payment efficiency, financial inclusion, and monetary policy transmission.',
    'GlobalFinance',
    'Emma Thompson',
    CURRENT_TIMESTAMP - INTERVAL '8 hours',
    'https://globalfinance.com/cbdc-momentum-global',
    '/placeholder.svg?height=200&width=400&text=CBDC+Global',
    'Regulation',
    ARRAY['CBDC', 'Central Bank', 'Digital Currency', 'Regulation', 'Government'],
    'neutral',
    6
),
(
    'NFT Market Shows Signs of Recovery After Prolonged Downturn',
    'Non-fungible token sales volume increases 40% this month as new utility-focused projects gain traction.',
    'The NFT market is showing signs of recovery after months of declining activity. Trading volume has increased by 40% this month, driven by new projects that focus on utility rather than speculation. Gaming NFTs, music rights tokens, and real-world asset tokenization are leading the recovery. Major brands are also re-entering the space with more thoughtful approaches, focusing on community building and long-term value creation rather than quick cash grabs. This shift towards utility-based NFTs suggests a maturing market.',
    'NFTTrends',
    'David Kim',
    CURRENT_TIMESTAMP - INTERVAL '12 hours',
    'https://nfttrends.com/nft-market-recovery-signs',
    '/placeholder.svg?height=200&width=400&text=NFT+Recovery',
    'NFTs',
    ARRAY['NFT', 'Recovery', 'Utility', 'Gaming', 'Brands'],
    'positive',
    5
),
(
    'Layer 2 Solutions See Explosive Growth in Transaction Volume',
    'Ethereum Layer 2 networks process record-breaking transaction volumes as users seek lower fees and faster confirmations.',
    'Layer 2 scaling solutions for Ethereum have experienced explosive growth, with combined transaction volumes reaching new all-time highs. Arbitrum, Optimism, and Polygon have seen their daily transaction counts increase by over 300% in the past quarter. This growth is driven by users seeking alternatives to Ethereum''s high gas fees and slower confirmation times. DeFi protocols, NFT marketplaces, and gaming applications are increasingly deploying on Layer 2 networks, creating a thriving ecosystem that maintains Ethereum''s security while offering improved user experience.',
    'Layer2News',
    'Jennifer Walsh',
    CURRENT_TIMESTAMP - INTERVAL '16 hours',
    'https://layer2news.com/l2-explosive-growth-volume',
    '/placeholder.svg?height=200&width=400&text=Layer+2+Growth',
    'Technology',
    ARRAY['Layer 2', 'Scaling', 'Arbitrum', 'Optimism', 'Polygon'],
    'positive',
    7
),
(
    'Regulatory Clarity Emerges as SEC Provides New Crypto Guidelines',
    'The Securities and Exchange Commission releases comprehensive guidelines for cryptocurrency classification and compliance.',
    'The SEC has released new comprehensive guidelines that provide much-needed clarity for the cryptocurrency industry. The guidelines establish clear criteria for determining whether a digital asset should be classified as a security, commodity, or utility token. This regulatory clarity is expected to boost institutional adoption and reduce compliance uncertainty for crypto businesses. The guidelines also outline registration requirements for crypto exchanges and provide safe harbor provisions for certain types of tokens. Industry leaders have welcomed these developments as a positive step toward mainstream adoption.',
    'RegulatoryUpdate',
    'Robert Martinez',
    CURRENT_TIMESTAMP - INTERVAL '20 hours',
    'https://regulatoryupdate.com/sec-crypto-guidelines-clarity',
    '/placeholder.svg?height=200&width=400&text=SEC+Guidelines',
    'Regulation',
    ARRAY['SEC', 'Regulation', 'Guidelines', 'Compliance', 'Legal'],
    'positive',
    8
),
(
    'Crypto Mining Industry Shifts Toward Renewable Energy',
    'Major mining operations announce commitments to 100% renewable energy as environmental concerns drive industry transformation.',
    'The cryptocurrency mining industry is undergoing a significant transformation as major operations commit to using 100% renewable energy. Leading mining companies have announced partnerships with solar and wind energy providers, with some operations already achieving carbon neutrality. This shift is driven by both environmental concerns and economic incentives, as renewable energy costs continue to decline. The Bitcoin Mining Council reports that over 58% of the network now uses sustainable energy sources, up from 36% last year. This trend is expected to accelerate as ESG considerations become increasingly important for institutional investors.',
    'GreenCrypto',
    'Lisa Anderson',
    CURRENT_TIMESTAMP - INTERVAL '24 hours',
    'https://greencrypto.com/mining-renewable-energy-shift',
    '/placeholder.svg?height=200&width=400&text=Green+Mining',
    'Environment',
    ARRAY['Mining', 'Renewable Energy', 'Sustainability', 'ESG', 'Environment'],
    'positive',
    6
);

-- Create additional utility functions
CREATE OR REPLACE FUNCTION search_news(
    search_term TEXT DEFAULT NULL,
    sentiment_filter TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    source VARCHAR(100),
    author VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE,
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    category VARCHAR(50),
    tags TEXT[],
    sentiment VARCHAR(20),
    impact_score INTEGER,
    view_count INTEGER,
    time_ago TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.source,
        n.author,
        n.published_at,
        n.url,
        n.image_url,
        n.category,
        n.tags,
        n.sentiment,
        n.impact_score,
        n.view_count,
        pn.time_ago
    FROM news_articles n
    JOIN published_news pn ON n.id = pn.id
    WHERE 
        (search_term IS NULL OR 
         to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content || ' ' || array_to_string(n.tags, ' ')) 
         @@ plainto_tsquery('english', search_term))
        AND (sentiment_filter IS NULL OR n.sentiment = sentiment_filter)
        AND (category_filter IS NULL OR n.category = category_filter)
        AND n.is_published = TRUE
    ORDER BY n.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trending tags
CREATE OR REPLACE FUNCTION get_trending_tags(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (tag TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(tags) as tag,
        COUNT(*) as count
    FROM news_articles 
    WHERE is_published = TRUE 
        AND published_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
    GROUP BY unnest(tags)
    ORDER BY count DESC, tag ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS news_analytics AS
SELECT 
    DATE(published_at) as date,
    category,
    sentiment,
    COUNT(*) as article_count,
    AVG(impact_score) as avg_impact_score,
    SUM(view_count) as total_views
FROM news_articles 
WHERE is_published = TRUE
GROUP BY DATE(published_at), category, sentiment
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_news_analytics_date ON news_analytics(date DESC);

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_news_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW news_analytics;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON news_articles TO your_app_user;
-- GRANT SELECT ON published_news TO your_app_user;
-- GRANT EXECUTE ON FUNCTION search_news TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_trending_tags TO your_app_user;
-- GRANT EXECUTE ON FUNCTION increment_view_count TO your_app_user;

COMMIT;
