-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    impact_score INTEGER DEFAULT 5 CHECK (impact_score >= 1 AND impact_score <= 10),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_title_search ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_content_search ON news_articles USING GIN(to_tsvector('english', content));

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin has achieved a historic milestone today, surpassing its previous all-time high to reach $75,000. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing significant Bitcoin purchases. The cryptocurrency market has responded positively, with total market capitalization exceeding $2.8 trillion. Analysts attribute this growth to improved regulatory clarity and growing acceptance of Bitcoin as a store of value. Major financial institutions have also begun offering Bitcoin custody services, further legitimizing the asset class.',
    'CryptoNews Daily',
    'https://example.com/bitcoin-ath',
    NOW() - INTERVAL '2 hours',
    0.8,
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bullish']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures',
    'Ethereum staking rewards have decreased to 3.2% APY as the network becomes more decentralized with over 1 million validators participating.',
    'The Ethereum network has reached a new level of maturity with staking rewards dropping to a record low of 3.2% APY. This decrease is attributed to the growing number of validators, which now exceeds 1 million participants. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The total value locked in Ethereum 2.0 staking has surpassed $120 billion, representing approximately 25% of all ETH in circulation. This milestone demonstrates the community''s long-term commitment to the network''s proof-of-stake consensus mechanism.',
    'Ethereum Insights',
    'https://example.com/eth-staking',
    NOW() - INTERVAL '4 hours',
    0.3,
    6,
    ARRAY['Ethereum', 'Staking', 'ETH2', 'Decentralization']
),
(
    'DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.',
    'A significant security breach has occurred in the DeFi space, with a popular lending protocol losing $50 million to an exploit. The attack utilized a reentrancy vulnerability that allowed the attacker to drain funds from the protocol''s liquidity pools. The protocol team has immediately paused all operations and is working with security firms to assess the damage. This incident highlights the ongoing risks in DeFi protocols and the importance of thorough security audits. The exploit has caused the protocol''s native token to drop by 40% in the past hour. Users are advised to withdraw their funds from similar protocols until further security measures are implemented.',
    'DeFi Security Watch',
    'https://example.com/defi-exploit',
    NOW() - INTERVAL '6 hours',
    -0.9,
    8,
    ARRAY['DeFi', 'Security', 'Exploit', 'Smart Contract']
),
(
    'Central Bank Digital Currency Pilot Program Shows Promising Results',
    'The Federal Reserve''s CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced settlement times.',
    'The Federal Reserve has announced positive results from the first phase of its Central Bank Digital Currency (CBDC) pilot program. The digital dollar prototype demonstrated significant improvements in transaction processing speed and settlement efficiency compared to traditional banking systems. Transactions that typically take 2-3 business days were completed in seconds during the trial. The pilot involved partnerships with major commercial banks and fintech companies to test various use cases including cross-border payments and retail transactions. While still in early stages, the results suggest that a digital dollar could revolutionize the financial system. The next phase will focus on privacy features and interoperability with existing payment systems.',
    'Federal Reserve News',
    'https://example.com/cbdc-pilot',
    NOW() - INTERVAL '8 hours',
    0.6,
    7,
    ARRAY['CBDC', 'Federal Reserve', 'Digital Dollar', 'Banking']
),
(
    'NFT Market Shows Signs of Recovery with 40% Volume Increase',
    'The NFT marketplace has experienced a 40% increase in trading volume over the past week, suggesting a potential recovery from the recent downturn.',
    'The Non-Fungible Token (NFT) market is showing signs of recovery after months of declining activity. Trading volume has increased by 40% over the past week, with several high-profile collections seeing renewed interest. The recovery is attributed to new utility-focused projects and improved market sentiment. Major marketplaces report increased user engagement and new wallet connections. Gaming NFTs and utility tokens are leading the recovery, while profile picture collections remain subdued. Industry experts believe this uptick could signal the beginning of a more sustainable NFT market focused on real-world applications rather than speculation. The total NFT market capitalization has risen to $8.2 billion, up from $6.1 billion last month.',
    'NFT Market Report',
    'https://example.com/nft-recovery',
    NOW() - INTERVAL '12 hours',
    0.5,
    5,
    ARRAY['NFT', 'Recovery', 'Trading Volume', 'Gaming']
),
(
    'Regulatory Clarity Emerges as SEC Approves New Crypto Framework',
    'The Securities and Exchange Commission has approved a comprehensive framework for cryptocurrency regulation, providing much-needed clarity for the industry.',
    'The Securities and Exchange Commission (SEC) has taken a significant step forward in cryptocurrency regulation by approving a comprehensive framework that provides clear guidelines for digital asset classification and compliance. The new framework establishes criteria for determining whether a cryptocurrency should be classified as a security, commodity, or utility token. This regulatory clarity is expected to encourage institutional investment and innovation in the crypto space. The framework also outlines requirements for crypto exchanges, custody services, and investment products. Industry leaders have praised the move as a positive step toward mainstream adoption. The announcement has led to a broad rally in cryptocurrency prices, with the total market cap increasing by 8% in the past 24 hours.',
    'Regulatory Update',
    'https://example.com/sec-framework',
    NOW() - INTERVAL '18 hours',
    0.7,
    9,
    ARRAY['Regulation', 'SEC', 'Framework', 'Compliance']
),
(
    'Layer 2 Solutions See Massive Growth as Ethereum Gas Fees Spike',
    'Ethereum Layer 2 solutions have experienced unprecedented growth as users seek alternatives to high mainnet gas fees.',
    'Ethereum Layer 2 scaling solutions are experiencing explosive growth as mainnet gas fees reach new highs. Arbitrum, Optimism, and Polygon have all reported record-breaking transaction volumes and user adoption. The combined total value locked (TVL) across all Layer 2 networks has surpassed $15 billion, representing a 300% increase from six months ago. Users are migrating to these solutions to avoid gas fees that can exceed $100 for simple transactions during peak network congestion. DeFi protocols are also expanding to Layer 2 networks, with many offering additional incentives for users who bridge their assets. This trend is accelerating the multi-chain future of Ethereum and demonstrating the effectiveness of scaling solutions in addressing network limitations.',
    'Layer 2 Analytics',
    'https://example.com/layer2-growth',
    NOW() - INTERVAL '1 day',
    0.4,
    7,
    ARRAY['Layer 2', 'Ethereum', 'Scaling', 'Gas Fees']
),
(
    'Cryptocurrency Mining Industry Faces Environmental Scrutiny',
    'Environmental groups are increasing pressure on cryptocurrency mining operations to adopt renewable energy sources and reduce carbon emissions.',
    'The cryptocurrency mining industry is facing increased scrutiny from environmental groups and regulators over its carbon footprint and energy consumption. Several major mining operations have announced commitments to achieve carbon neutrality by 2030, with some already transitioning to renewable energy sources. The Bitcoin Mining Council reports that sustainable energy usage in Bitcoin mining has increased to 58.4%, up from 36.8% in 2021. However, critics argue that this progress is insufficient given the urgency of climate change. Some jurisdictions are considering restrictions on energy-intensive mining operations, while others are promoting green mining initiatives. The industry is also exploring more energy-efficient consensus mechanisms and mining technologies to address these concerns.',
    'Environmental Crypto News',
    'https://example.com/mining-environment',
    NOW() - INTERVAL '1.5 days',
    -0.3,
    6,
    ARRAY['Mining', 'Environment', 'Sustainability', 'Energy']
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
