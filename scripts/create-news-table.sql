-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')) NOT NULL,
    impact INTEGER CHECK (impact >= 1 AND impact <= 10) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_articles(impact DESC);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_news_search ON news_articles USING GIN(
    to_tsvector('english', title || ' ' || summary || ' ' || content)
);

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

-- Insert sample data
INSERT INTO news_articles (title, summary, content, source, published_at, sentiment, impact, tags, image_url) VALUES
(
    'Bitcoin Surges Past $45,000 as Institutional Adoption Accelerates',
    'Major corporations continue to add Bitcoin to their treasury reserves, driving unprecedented institutional demand.',
    'Bitcoin has broken through the $45,000 resistance level as institutional adoption continues to accelerate. Major corporations including MicroStrategy, Tesla, and Square have added significant amounts of Bitcoin to their treasury reserves. This institutional demand, combined with growing retail interest, has created a perfect storm for Bitcoin''s latest rally. Analysts predict that if the current trend continues, Bitcoin could reach new all-time highs within the next quarter.',
    'CryptoNews Daily',
    NOW() - INTERVAL '2 hours',
    'positive',
    9,
    ARRAY['Bitcoin', 'Institutional', 'Adoption', 'Price'],
    '/placeholder.svg?height=200&width=400&text=Bitcoin+Chart'
),
(
    'Ethereum 2.0 Staking Rewards Hit Record High Amid Network Upgrades',
    'Ethereum staking yields reach 8.5% APY as network improvements drive increased validator participation.',
    'Ethereum 2.0 staking rewards have reached a record high of 8.5% APY, attracting more validators to secure the network. The recent network upgrades have improved transaction throughput and reduced gas fees, making Ethereum more attractive to both developers and users. With over 32 million ETH now staked, representing nearly 27% of the total supply, the network security has never been stronger.',
    'DeFi Analytics',
    NOW() - INTERVAL '4 hours',
    'positive',
    8,
    ARRAY['Ethereum', 'Staking', 'DeFi', 'Yield'],
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking'
),
(
    'SEC Delays Decision on Spot Bitcoin ETF Applications Again',
    'Regulatory uncertainty continues as the SEC postpones approval decisions for multiple Bitcoin ETF proposals.',
    'The Securities and Exchange Commission has once again delayed its decision on several spot Bitcoin ETF applications, citing the need for additional review time. This marks the third delay for some applications, creating continued uncertainty in the market. Despite the delays, industry experts remain optimistic that approval will eventually come, potentially opening the floodgates for institutional investment.',
    'Regulatory Watch',
    NOW() - INTERVAL '6 hours',
    'negative',
    7,
    ARRAY['SEC', 'ETF', 'Regulation', 'Bitcoin'],
    '/placeholder.svg?height=200&width=400&text=SEC+Building'
),
(
    'DeFi Protocol Launches Revolutionary Cross-Chain Bridge',
    'New interoperability solution promises to connect major blockchains with unprecedented security and speed.',
    'A groundbreaking DeFi protocol has launched a revolutionary cross-chain bridge that connects Ethereum, Binance Smart Chain, Polygon, and Avalanche with unprecedented security measures. The bridge uses advanced cryptographic proofs and multi-signature validation to ensure secure asset transfers across chains. Early testing shows transaction times of under 30 seconds with fees 90% lower than existing solutions.',
    'DeFi Innovation Hub',
    NOW() - INTERVAL '8 hours',
    'positive',
    6,
    ARRAY['DeFi', 'Cross-chain', 'Innovation', 'Interoperability'],
    '/placeholder.svg?height=200&width=400&text=Cross+Chain+Bridge'
),
(
    'Major Exchange Suffers Security Breach, $50M in Crypto Stolen',
    'Hackers exploit smart contract vulnerability to drain funds from popular decentralized exchange.',
    'A major decentralized exchange has suffered a significant security breach, with hackers stealing approximately $50 million in various cryptocurrencies. The attack exploited a previously unknown vulnerability in the exchange''s smart contract code. The exchange has immediately halted all trading and is working with security firms to investigate the breach. Users are advised to withdraw their funds as soon as trading resumes.',
    'Crypto Security Alert',
    NOW() - INTERVAL '12 hours',
    'negative',
    8,
    ARRAY['Security', 'Hack', 'DEX', 'Smart Contract'],
    '/placeholder.svg?height=200&width=400&text=Security+Breach'
),
(
    'Central Bank Digital Currency Pilot Program Shows Promising Results',
    'Government-backed digital currency trial demonstrates improved transaction efficiency and financial inclusion.',
    'A major central bank has released positive results from its digital currency pilot program, showing significant improvements in transaction efficiency and financial inclusion. The CBDC processed over 1 million transactions during the 6-month trial with 99.9% uptime and average settlement times of 2 seconds. The success of the pilot has led to plans for a nationwide rollout within the next 18 months.',
    'Central Banking Today',
    NOW() - INTERVAL '18 hours',
    'neutral',
    7,
    ARRAY['CBDC', 'Government', 'Digital Currency', 'Pilot'],
    '/placeholder.svg?height=200&width=400&text=Digital+Currency'
),
(
    'NFT Marketplace Introduces Carbon-Neutral Minting Process',
    'Leading NFT platform partners with renewable energy providers to offset environmental impact.',
    'A leading NFT marketplace has announced a groundbreaking carbon-neutral minting process, partnering with renewable energy providers to offset the environmental impact of NFT creation. The platform will purchase carbon credits equivalent to the energy consumption of each NFT minted, making it the first major marketplace to achieve true carbon neutrality. This move comes as environmental concerns about blockchain technology continue to grow.',
    'Green Crypto News',
    NOW() - INTERVAL '24 hours',
    'positive',
    5,
    ARRAY['NFT', 'Environment', 'Carbon Neutral', 'Sustainability'],
    '/placeholder.svg?height=200&width=400&text=Green+NFT'
),
(
    'Crypto Lending Platform Offers 12% APY on Stablecoin Deposits',
    'New DeFi protocol attracts billions in TVL with competitive yield farming opportunities.',
    'A new DeFi lending platform has launched with attractive 12% APY rates on stablecoin deposits, quickly attracting over $2 billion in total value locked (TVL). The platform uses innovative yield farming strategies and automated market making to generate returns for depositors. Security audits by leading firms have given the protocol high marks for safety and transparency.',
    'Yield Farming Weekly',
    NOW() - INTERVAL '30 hours',
    'positive',
    6,
    ARRAY['DeFi', 'Lending', 'Yield Farming', 'Stablecoin'],
    '/placeholder.svg?height=200&width=400&text=DeFi+Lending'
);

-- Create view for recent news with formatted data
CREATE OR REPLACE VIEW recent_news AS
SELECT 
    id,
    title,
    summary,
    content,
    source,
    published_at,
    sentiment,
    impact,
    tags,
    image_url,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - published_at))/3600 as hours_ago
FROM news_articles
ORDER BY published_at DESC;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_news(search_term TEXT)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    source VARCHAR(200),
    published_at TIMESTAMP WITH TIME ZONE,
    sentiment VARCHAR(20),
    impact INTEGER,
    tags TEXT[],
    image_url VARCHAR(500),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.summary,
        n.content,
        n.source,
        n.published_at,
        n.sentiment,
        n.impact,
        n.tags,
        n.image_url,
        ts_rank(to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content), plainto_tsquery('english', search_term)) as rank
    FROM news_articles n
    WHERE to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content) @@ plainto_tsquery('english', search_term)
    ORDER BY rank DESC, n.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE news_articles_id_seq TO your_app_user;
-- GRANT SELECT ON recent_news TO your_app_user;
-- GRANT EXECUTE ON FUNCTION search_news(TEXT) TO your_app_user;

COMMIT;
