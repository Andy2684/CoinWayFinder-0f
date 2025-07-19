-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    image_url VARCHAR(1000),
    tags TEXT[] NOT NULL DEFAULT '{}',
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    impact_score INTEGER NOT NULL CHECK (impact_score >= 1 AND impact_score <= 10),
    source VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INTEGER NOT NULL DEFAULT 0,
    external_id VARCHAR(255) UNIQUE,
    slug VARCHAR(500) UNIQUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_active ON news_articles(is_active) WHERE is_active = TRUE;

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

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug
CREATE OR REPLACE FUNCTION set_article_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.title);
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM news_articles WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug = NEW.slug || '-' || extract(epoch from now())::integer;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_news_article_slug ON news_articles;
CREATE TRIGGER set_news_article_slug
    BEFORE INSERT OR UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION set_article_slug();

-- Insert sample data
INSERT INTO news_articles (
    title, summary, content, author, published_at, image_url, tags, 
    sentiment, impact_score, source, category, external_id
) VALUES 
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin has achieved a significant milestone today, breaking through the $73,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The rally has been fueled by growing acceptance of Bitcoin as a store of value and hedge against inflation. Market analysts suggest that the current bull run could continue as more institutional investors enter the space. The cryptocurrency has gained over 150% year-to-date, outperforming traditional assets like gold and the S&P 500.',
    'Sarah Chen',
    NOW() - INTERVAL '2 hours',
    '/placeholder.svg?height=200&width=400&text=Bitcoin+ATH',
    ARRAY['Bitcoin', 'Cryptocurrency', 'Institutional', 'ATH'],
    'positive',
    9,
    'CryptoDaily',
    'Market Analysis',
    'btc-ath-2024-001'
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures',
    'Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturation and increased validator participation.',
    'Ethereum''s proof-of-stake network is showing signs of maturation as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators securing the network, which now exceeds 900,000 active validators. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The reduction in rewards is also contributing to Ethereum''s deflationary pressure, with more ETH being burned than issued in recent weeks.',
    'Michael Rodriguez',
    NOW() - INTERVAL '4 hours',
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking',
    ARRAY['Ethereum', 'Staking', 'ETH2', 'Validators'],
    'neutral',
    6,
    'BlockchainNews',
    'Technology',
    'eth-staking-2024-001'
),
(
    'DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.',
    'The DeFi space has been rocked by another major exploit, with a prominent lending protocol losing approximately $50 million to hackers. The attack exploited a reentrancy vulnerability in the protocol''s smart contract, allowing the attacker to drain funds from multiple pools. This incident highlights the ongoing security challenges facing the DeFi ecosystem, despite multiple audits of the affected protocol. The team has paused all protocol operations and is working with security firms to assess the damage. Users are advised to withdraw their funds from similar protocols as a precautionary measure.',
    'Alex Thompson',
    NOW() - INTERVAL '6 hours',
    '/placeholder.svg?height=200&width=400&text=DeFi+Exploit',
    ARRAY['DeFi', 'Security', 'Exploit', 'Smart Contracts'],
    'negative',
    8,
    'DeFiWatch',
    'Security',
    'defi-exploit-2024-001'
),
(
    'Central Bank Digital Currencies Gain Momentum with New Pilot Programs',
    'Several central banks have announced new CBDC pilot programs, signaling accelerated adoption of digital currencies by governments worldwide.',
    'The race for central bank digital currencies (CBDCs) is heating up as five major economies have announced new pilot programs this week. The European Central Bank, Bank of Japan, and Reserve Bank of Australia are among those launching comprehensive testing phases for their digital currencies. These initiatives aim to modernize payment systems, improve financial inclusion, and maintain monetary sovereignty in an increasingly digital economy. The pilots will test various aspects including privacy, scalability, and interoperability with existing financial infrastructure. Industry experts predict that at least 10 major CBDCs will be operational by 2025.',
    'Emma Watson',
    NOW() - INTERVAL '8 hours',
    '/placeholder.svg?height=200&width=400&text=CBDC+Pilots',
    ARRAY['CBDC', 'Central Banks', 'Digital Currency', 'Government'],
    'positive',
    7,
    'FinTechToday',
    'Regulation',
    'cbdc-pilots-2024-001'
),
(
    'NFT Market Shows Signs of Recovery with Blue-Chip Collections Leading',
    'The NFT market is experiencing a resurgence with blue-chip collections seeing increased trading volume and floor prices rising across major marketplaces.',
    'After months of declining activity, the NFT market is showing promising signs of recovery. Blue-chip collections like CryptoPunks, Bored Ape Yacht Club, and Art Blocks have seen significant increases in trading volume over the past week. Floor prices for these premium collections have risen by 15-30%, indicating renewed investor confidence. The recovery is attributed to improved market sentiment, new utility announcements from major projects, and the integration of NFTs into gaming and metaverse platforms. OpenSea and Blur have reported their highest weekly volumes in six months.',
    'David Kim',
    NOW() - INTERVAL '12 hours',
    '/placeholder.svg?height=200&width=400&text=NFT+Recovery',
    ARRAY['NFT', 'Digital Art', 'Collectibles', 'Marketplace'],
    'positive',
    5,
    'NFTInsider',
    'NFTs',
    'nft-recovery-2024-001'
),
(
    'Layer 2 Solutions See Explosive Growth as Ethereum Gas Fees Remain High',
    'Ethereum Layer 2 networks have processed record transaction volumes as users seek alternatives to high mainnet gas fees.',
    'Ethereum''s Layer 2 ecosystem is experiencing unprecedented growth, with networks like Arbitrum, Optimism, and Polygon processing record transaction volumes. The surge in L2 adoption comes as Ethereum mainnet gas fees remain elevated due to increased network activity. Arbitrum alone has processed over 2 million transactions in a single day, while Optimism has seen a 400% increase in daily active users over the past month. This growth is driving innovation in the L2 space, with new solutions focusing on improved user experience and lower costs. The success of L2s is crucial for Ethereum''s scalability roadmap.',
    'Lisa Park',
    NOW() - INTERVAL '16 hours',
    '/placeholder.svg?height=200&width=400&text=Layer+2+Growth',
    ARRAY['Layer 2', 'Ethereum', 'Scaling', 'Gas Fees'],
    'positive',
    6,
    'L2Beat',
    'Technology',
    'l2-growth-2024-001'
),
(
    'Regulatory Clarity Emerges as SEC Provides New Guidance on Crypto Assets',
    'The SEC has released comprehensive guidance on cryptocurrency classification, providing much-needed clarity for the industry.',
    'The Securities and Exchange Commission has published new guidance clarifying how it will classify various cryptocurrency assets, marking a significant step toward regulatory clarity in the United States. The guidance establishes clear criteria for determining whether a digital asset constitutes a security, focusing on factors such as decentralization, utility, and investor expectations. This development has been welcomed by industry participants who have long sought clearer regulatory frameworks. The guidance is expected to facilitate institutional adoption and encourage innovation while maintaining investor protection. Legal experts suggest this could pave the way for more crypto ETF approvals.',
    'Robert Johnson',
    NOW() - INTERVAL '20 hours',
    '/placeholder.svg?height=200&width=400&text=SEC+Guidance',
    ARRAY['Regulation', 'SEC', 'Compliance', 'Legal'],
    'positive',
    8,
    'RegulatoryNews',
    'Regulation',
    'sec-guidance-2024-001'
),
(
    'Web3 Gaming Sector Attracts $2B in Venture Capital Funding This Quarter',
    'The Web3 gaming sector has secured record venture capital funding, with investors betting on the future of blockchain-based gaming experiences.',
    'The Web3 gaming sector has reached a new milestone with $2 billion in venture capital funding secured in the current quarter, representing a 150% increase from the previous quarter. Major gaming studios and blockchain startups are attracting significant investment as they develop play-to-earn games, NFT-based gaming assets, and decentralized gaming platforms. Notable funding rounds include a $200 million Series B for a metaverse gaming platform and a $150 million investment in a blockchain gaming infrastructure company. Investors are particularly interested in games that combine traditional gaming mechanics with blockchain technology to create sustainable economic models.',
    'Jennifer Lee',
    NOW() - INTERVAL '24 hours',
    '/placeholder.svg?height=200&width=400&text=Web3+Gaming',
    ARRAY['Web3', 'Gaming', 'Venture Capital', 'Investment'],
    'positive',
    7,
    'GameFi Daily',
    'Gaming',
    'web3-gaming-2024-001'
)
ON CONFLICT (external_id) DO NOTHING;

-- Create view for active articles with computed fields
CREATE OR REPLACE VIEW active_news_articles AS
SELECT 
    id,
    title,
    summary,
    content,
    author,
    published_at,
    image_url,
    tags,
    sentiment,
    impact_score,
    source,
    category,
    created_at,
    updated_at,
    view_count,
    slug,
    EXTRACT(EPOCH FROM (NOW() - published_at))/3600 as hours_ago,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - published_at))/3600 < 1 THEN 'Just now'
        WHEN EXTRACT(EPOCH FROM (NOW() - published_at))/3600 < 24 THEN 
            EXTRACT(EPOCH FROM (NOW() - published_at))/3600 || 'h ago'
        ELSE 
            EXTRACT(EPOCH FROM (NOW() - published_at))/(3600*24) || 'd ago'
    END as time_ago
FROM news_articles 
WHERE is_active = TRUE;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_news_articles(
    search_query TEXT DEFAULT '',
    sentiment_filter TEXT DEFAULT 'all',
    sort_by TEXT DEFAULT 'date',
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
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
    time_ago TEXT,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.summary,
        a.content,
        a.author,
        a.published_at,
        a.image_url,
        a.tags,
        a.sentiment,
        a.impact_score,
        a.source,
        a.category,
        CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - a.published_at))/3600 < 1 THEN 'Just now'
            WHEN EXTRACT(EPOCH FROM (NOW() - a.published_at))/3600 < 24 THEN 
                FLOOR(EXTRACT(EPOCH FROM (NOW() - a.published_at))/3600)::TEXT || 'h ago'
            ELSE 
                FLOOR(EXTRACT(EPOCH FROM (NOW() - a.published_at))/(3600*24))::TEXT || 'd ago'
        END as time_ago,
        CASE 
            WHEN search_query = '' THEN 1.0
            ELSE ts_rank(to_tsvector('english', a.title || ' ' || a.summary || ' ' || a.content), plainto_tsquery('english', search_query))
        END as relevance_score
    FROM news_articles a
    WHERE a.is_active = TRUE
        AND (search_query = '' OR 
             to_tsvector('english', a.title || ' ' || a.summary || ' ' || a.content) @@ plainto_tsquery('english', search_query) OR
             EXISTS (SELECT 1 FROM unnest(a.tags) tag WHERE LOWER(tag) LIKE '%' || LOWER(search_query) || '%'))
        AND (sentiment_filter = 'all' OR a.sentiment = sentiment_filter)
    ORDER BY 
        CASE 
            WHEN sort_by = 'date' THEN a.published_at
        END DESC,
        CASE 
            WHEN sort_by = 'impact' THEN a.impact_score
        END DESC,
        CASE 
            WHEN sort_by = 'sentiment' THEN 
                CASE a.sentiment 
                    WHEN 'positive' THEN 3
                    WHEN 'neutral' THEN 2
                    WHEN 'negative' THEN 1
                END
        END DESC,
        relevance_score DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles 
    SET view_count = view_count + 1 
    WHERE id = article_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS news_analytics AS
SELECT 
    DATE(published_at) as date,
    sentiment,
    category,
    COUNT(*) as article_count,
    AVG(impact_score) as avg_impact_score,
    SUM(view_count) as total_views
FROM news_articles 
WHERE is_active = TRUE
GROUP BY DATE(published_at), sentiment, category
ORDER BY date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_analytics_unique 
ON news_analytics (date, sentiment, category);

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_news_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY news_analytics;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON news_articles TO your_app_user;
-- GRANT SELECT ON active_news_articles TO your_app_user;
-- GRANT EXECUTE ON FUNCTION search_news_articles TO your_app_user;
-- GRANT EXECUTE ON FUNCTION increment_view_count TO your_app_user;

COMMIT;
