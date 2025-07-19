-- Create news_articles table with proper indexes and constraints
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    url VARCHAR(1000) NOT NULL UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment_score DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    impact_score INTEGER DEFAULT 1 CHECK (impact_score >= 1 AND impact_score <= 10),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_score ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_title_search ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_content_search ON news_articles USING GIN(to_tsvector('english', content));

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin has achieved a significant milestone today, breaking through the $75,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The cryptocurrency market has responded positively, with total market capitalization exceeding $2.8 trillion. Analysts attribute this growth to improved regulatory clarity and growing acceptance of Bitcoin as a store of value. Major financial institutions have also begun offering Bitcoin custody services, further legitimizing the asset class.',
    'CryptoNews Daily',
    'https://example.com/bitcoin-ath-' || extract(epoch from now()),
    NOW() - INTERVAL '2 hours',
    0.8,
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bullish']
),
(
    'Ethereum 2.0 Staking Rewards Increase Following Network Upgrade',
    'The latest Ethereum network upgrade has resulted in higher staking rewards for validators, with APY increasing to 6.2%.',
    'Ethereum validators are now earning higher rewards following the successful implementation of the latest network upgrade. The annual percentage yield (APY) for staking ETH has increased from 4.8% to 6.2%, making it more attractive for long-term holders to participate in network security. This upgrade also includes improvements to transaction processing speed and reduced gas fees during peak usage periods. The Ethereum Foundation reports that over 32 million ETH is now staked, representing approximately 26% of the total supply.',
    'Ethereum Weekly',
    'https://example.com/eth-staking-' || extract(epoch from now()),
    NOW() - INTERVAL '4 hours',
    0.6,
    7,
    ARRAY['Ethereum', 'Staking', 'Upgrade', 'Rewards']
),
(
    'DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.',
    'A significant security breach has occurred in the DeFi space, with a popular lending protocol losing $50 million to an exploit. The attack utilized a reentrancy vulnerability that allowed the attacker to drain funds from the protocol''s liquidity pools. The protocol team has paused all operations and is working with security firms to assess the damage. This incident highlights the ongoing security challenges in DeFi, where smart contract vulnerabilities can lead to substantial losses. Users are advised to withdraw their funds from similar protocols until security audits are completed.',
    'DeFi Security Report',
    'https://example.com/defi-exploit-' || extract(epoch from now()),
    NOW() - INTERVAL '6 hours',
    -0.7,
    8,
    ARRAY['DeFi', 'Security', 'Exploit', 'Smart Contract']
),
(
    'Central Bank Digital Currency Pilot Program Shows Promising Results',
    'The Federal Reserve''s CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced costs.',
    'The Federal Reserve has released preliminary results from its Central Bank Digital Currency (CBDC) pilot program, indicating significant improvements in transaction processing and cost reduction. The pilot, conducted with select financial institutions, demonstrated 40% faster settlement times and 60% lower transaction costs compared to traditional banking systems. Privacy concerns remain a key focus, with the Fed emphasizing that the digital dollar would maintain user privacy while providing regulatory oversight. The next phase will expand testing to include retail transactions and cross-border payments.',
    'Federal Reserve Bulletin',
    'https://example.com/cbdc-pilot-' || extract(epoch from now()),
    NOW() - INTERVAL '8 hours',
    0.3,
    6,
    ARRAY['CBDC', 'Federal Reserve', 'Digital Currency', 'Pilot']
),
(
    'NFT Market Shows Signs of Recovery with 25% Volume Increase',
    'The NFT marketplace has experienced a 25% increase in trading volume over the past week, signaling potential market recovery.',
    'After months of declining activity, the NFT market is showing signs of recovery with a 25% increase in trading volume over the past week. This uptick is attributed to new utility-focused projects and improved market sentiment. Major marketplaces report increased user engagement and higher average sale prices. Gaming NFTs and utility tokens are leading the recovery, while profile picture collections remain subdued. Industry experts suggest this could be the beginning of a more sustainable NFT market focused on real-world utility rather than speculation.',
    'NFT Market Analysis',
    'https://example.com/nft-recovery-' || extract(epoch from now()),
    NOW() - INTERVAL '12 hours',
    0.4,
    5,
    ARRAY['NFT', 'Recovery', 'Trading Volume', 'Utility']
),
(
    'Regulatory Clarity Boosts Crypto Exchange Listings in Major Markets',
    'New regulatory frameworks in the EU and Asia have led to increased cryptocurrency exchange listings and institutional participation.',
    'The implementation of comprehensive cryptocurrency regulations in the European Union and several Asian markets has resulted in a surge of new exchange listings and institutional participation. The Markets in Crypto-Assets (MiCA) regulation in the EU has provided clear guidelines for crypto operations, leading to increased confidence among traditional financial institutions. Major banks are now offering cryptocurrency custody services, and several new crypto ETFs have been approved. This regulatory clarity is expected to drive further institutional adoption and market maturation.',
    'Regulatory Crypto News',
    'https://example.com/regulatory-clarity-' || extract(epoch from now()),
    NOW() - INTERVAL '18 hours',
    0.7,
    8,
    ARRAY['Regulation', 'MiCA', 'Institutional', 'Exchanges']
),
(
    'Layer 2 Solutions See Record Adoption as Gas Fees Remain High',
    'Ethereum Layer 2 solutions have processed over 1 million transactions daily as users seek alternatives to high mainnet fees.',
    'Ethereum Layer 2 scaling solutions have reached a new milestone, processing over 1 million transactions daily as users migrate from the expensive mainnet. Arbitrum and Optimism lead in transaction volume, while Polygon continues to dominate in user adoption. The average transaction cost on Layer 2 networks is now 95% lower than Ethereum mainnet, making DeFi and NFT activities more accessible to retail users. This trend is expected to continue as more protocols deploy on Layer 2 solutions and cross-chain bridges improve interoperability.',
    'Layer 2 Analytics',
    'https://example.com/layer2-adoption-' || extract(epoch from now()),
    NOW() - INTERVAL '24 hours',
    0.5,
    6,
    ARRAY['Layer 2', 'Scaling', 'Gas Fees', 'Arbitrum', 'Optimism']
),
(
    'Crypto Mining Industry Shifts Toward Renewable Energy Sources',
    'Major cryptocurrency mining operations are transitioning to renewable energy, with 60% now using sustainable power sources.',
    'The cryptocurrency mining industry has made significant progress in adopting renewable energy sources, with recent studies showing that 60% of mining operations now use sustainable power. This shift is driven by both environmental concerns and economic incentives, as renewable energy often provides lower long-term costs. Solar and wind power installations specifically designed for mining operations are becoming increasingly common. The Bitcoin Mining Council reports that the network''s sustainable energy mix has improved by 15% over the past year, addressing one of the main criticisms of cryptocurrency mining.',
    'Green Mining Report',
    'https://example.com/green-mining-' || extract(epoch from now()),
    NOW() - INTERVAL '30 hours',
    0.6,
    7,
    ARRAY['Mining', 'Renewable Energy', 'Sustainability', 'Bitcoin']
)
ON CONFLICT (url) DO NOTHING;

-- Create a function to update the updated_at timestamp
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
