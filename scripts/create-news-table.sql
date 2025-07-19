-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    image_url VARCHAR(1000),
    tags TEXT[] DEFAULT '{}',
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10) DEFAULT 5,
    source VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_news_search ON news_articles USING GIN(
    to_tsvector('english', title || ' ' || summary || ' ' || content)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, author, published_at, image_url, tags, sentiment, impact_score, source, category) VALUES
(
    'Bitcoin Reaches New All-Time High Above $75,000',
    'Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.',
    'Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency''s journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence. Technical analysis suggests strong momentum with key resistance levels being broken decisively.',
    'Sarah Chen',
    NOW() - INTERVAL '2 hours',
    '/placeholder.svg?height=200&width=400&text=Bitcoin+Chart',
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Price'],
    'positive',
    9,
    'CryptoDaily',
    'Market Analysis'
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Participation',
    'Over 32 million ETH now staked as validators rush to secure the network and earn rewards.',
    'Ethereum''s proof-of-stake network has reached a new milestone with over 32 million ETH now staked by validators. This represents approximately 26% of the total ETH supply, demonstrating strong confidence in the network''s future. The high participation rate has led to more stable staking rewards and enhanced network security. Recent protocol upgrades have made staking more accessible to retail investors through liquid staking solutions.',
    'Michael Rodriguez',
    NOW() - INTERVAL '4 hours',
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking',
    ARRAY['Ethereum', 'Staking', 'ETH2', 'Validators'],
    'positive',
    7,
    'BlockchainNews',
    'Technology'
),
(
    'DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A major DeFi lending protocol lost $50 million in a sophisticated flash loan attack.',
    'A prominent DeFi lending protocol has fallen victim to a sophisticated exploit that drained approximately $50 million from its treasury. The attack utilized a complex flash loan mechanism to manipulate price oracles and extract funds. Security researchers have identified the vulnerability in the protocol''s smart contract code, which has since been patched. This incident highlights the ongoing security challenges facing the DeFi ecosystem and the importance of thorough code audits.',
    'Alex Thompson',
    NOW() - INTERVAL '6 hours',
    '/placeholder.svg?height=200&width=400&text=DeFi+Security',
    ARRAY['DeFi', 'Security', 'Exploit', 'Flash Loan'],
    'negative',
    8,
    'DeFiWatch',
    'Security'
),
(
    'Central Bank Digital Currency Pilot Program Launches in Major Economy',
    'A G7 nation begins testing its digital currency with select financial institutions.',
    'A major G7 economy has officially launched its Central Bank Digital Currency (CBDC) pilot program, marking a significant step toward mainstream digital currency adoption. The program involves collaboration with major banks and fintech companies to test real-world use cases. Initial focus areas include cross-border payments, retail transactions, and interoperability with existing payment systems. The pilot is expected to run for 12 months before potential wider rollout.',
    'Emma Wilson',
    NOW() - INTERVAL '8 hours',
    '/placeholder.svg?height=200&width=400&text=CBDC+Launch',
    ARRAY['CBDC', 'Central Bank', 'Digital Currency', 'Pilot'],
    'neutral',
    6,
    'FinanceToday',
    'Regulation'
),
(
    'NFT Marketplace Introduces Zero-Fee Trading to Compete with OpenSea',
    'A rising NFT platform eliminates trading fees to attract creators and collectors.',
    'A prominent NFT marketplace has announced the elimination of all trading fees in a bold move to compete with established platforms like OpenSea. The platform will instead generate revenue through premium services and partnerships. This decision comes as NFT trading volumes have declined from their 2021 peaks, forcing platforms to innovate to attract users. The move has been welcomed by creators who previously paid significant fees on transactions.',
    'David Park',
    NOW() - INTERVAL '12 hours',
    '/placeholder.svg?height=200&width=400&text=NFT+Marketplace',
    ARRAY['NFT', 'Marketplace', 'Zero Fees', 'Competition'],
    'positive',
    5,
    'NFTInsider',
    'NFTs'
),
(
    'Regulatory Uncertainty Causes Crypto Exchange to Exit Major Market',
    'Unclear regulations force a top-10 exchange to cease operations in a key jurisdiction.',
    'A major cryptocurrency exchange has announced its withdrawal from a significant market due to regulatory uncertainty and compliance challenges. The exchange cited unclear guidelines and potential legal risks as primary factors in the decision. This move affects millions of users who must transfer their assets to other platforms or international services. The development highlights the ongoing regulatory challenges facing the cryptocurrency industry globally.',
    'Lisa Chang',
    NOW() - INTERVAL '16 hours',
    '/placeholder.svg?height=200&width=400&text=Exchange+Exit',
    ARRAY['Regulation', 'Exchange', 'Compliance', 'Market Exit'],
    'negative',
    7,
    'CryptoRegulatory',
    'Regulation'
),
(
    'Layer 2 Scaling Solution Processes 1 Million Transactions in Single Day',
    'Ethereum Layer 2 network achieves new throughput milestone with minimal fees.',
    'An Ethereum Layer 2 scaling solution has achieved a significant milestone by processing over 1 million transactions in a single day while maintaining average fees below $0.01. This achievement demonstrates the potential of Layer 2 technologies to address Ethereum''s scalability challenges. The network has seen increased adoption from DeFi protocols and NFT platforms seeking lower transaction costs. Developer activity on the platform has increased by 300% over the past quarter.',
    'Ryan Kumar',
    NOW() - INTERVAL '20 hours',
    '/placeholder.svg?height=200&width=400&text=Layer+2+Scaling',
    ARRAY['Layer 2', 'Scaling', 'Ethereum', 'Transactions'],
    'positive',
    6,
    'TechCrypto',
    'Technology'
),
(
    'Institutional Crypto Custody Platform Secures $100M Series B Funding',
    'Growing institutional demand drives major investment in crypto infrastructure.',
    'A leading institutional cryptocurrency custody platform has secured $100 million in Series B funding, reflecting growing institutional interest in digital assets. The funding round was led by prominent venture capital firms and will be used to expand global operations and enhance security infrastructure. The platform currently holds over $10 billion in digital assets for institutional clients including pension funds, hedge funds, and family offices. This investment signals continued institutional adoption despite market volatility.',
    'Jennifer Martinez',
    NOW() - INTERVAL '24 hours',
    '/placeholder.svg?height=200&width=400&text=Custody+Funding',
    ARRAY['Institutional', 'Custody', 'Funding', 'Infrastructure'],
    'positive',
    5,
    'InvestmentNews',
    'Business'
);

-- Create view for recent news with computed fields
CREATE OR REPLACE VIEW recent_news AS
SELECT 
    *,
    EXTRACT(EPOCH FROM (NOW() - published_at))/3600 as hours_ago,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - published_at))/3600 < 1 THEN 'Just now'
        WHEN EXTRACT(EPOCH FROM (NOW() - published_at))/3600 < 24 THEN 
            EXTRACT(EPOCH FROM (NOW() - published_at))/3600 || 'h ago'
        ELSE 
            EXTRACT(EPOCH FROM (NOW() - published_at))/(3600*24) || 'd ago'
    END as time_ago
FROM news_articles
WHERE published_at >= NOW() - INTERVAL '30 days'
ORDER BY published_at DESC;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_news(search_term TEXT)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    image_url VARCHAR(1000),
    tags TEXT[],
    sentiment VARCHAR(20),
    impact_score INTEGER,
    source VARCHAR(255),
    category VARCHAR(100),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.author,
        n.published_at,
        n.image_url,
        n.tags,
        n.sentiment,
        n.impact_score,
        n.source,
        n.category,
        ts_rank(to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content), 
                plainto_tsquery('english', search_term)) as rank
    FROM news_articles n
    WHERE to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content) 
          @@ plainto_tsquery('english', search_term)
    ORDER BY rank DESC, n.published_at DESC;
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
    ARRAY_AGG(DISTINCT unnest(tags)) as popular_tags
FROM news_articles
WHERE published_at >= NOW() - INTERVAL '90 days'
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
-- GRANT SELECT ON recent_news TO your_app_user;
-- GRANT EXECUTE ON FUNCTION search_news(TEXT) TO your_app_user;
-- GRANT SELECT ON news_analytics TO your_app_user;

COMMIT;
