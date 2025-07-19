-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment_score DECIMAL(3,2) DEFAULT 0.0,
    impact_score INTEGER DEFAULT 5 CHECK (impact_score >= 1 AND impact_score <= 10),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_news_search ON news_articles USING GIN(
    to_tsvector('english', title || ' ' || summary || ' ' || content)
);

-- Insert sample data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $75,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin has achieved a significant milestone today, breaking through the $75,000 barrier for the first time in its history. This surge comes amid increased institutional adoption, with several Fortune 500 companies announcing Bitcoin purchases. The cryptocurrency has gained over 15% in the past week alone, driven by positive regulatory developments and growing mainstream acceptance. Market analysts suggest this could be the beginning of a new bull cycle, with some predicting Bitcoin could reach $100,000 by the end of the year. The surge has also lifted other cryptocurrencies, with Ethereum gaining 8% and many altcoins seeing double-digit increases.',
    'CryptoNews Daily',
    'https://example.com/bitcoin-ath',
    NOW() - INTERVAL '2 hours',
    0.8,
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bullish']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures',
    'Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturity and increased validator participation.',
    'Ethereum''s proof-of-stake network is showing signs of maturity as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators securing the network, now exceeding 900,000 active validators. While lower rewards might seem concerning, analysts view this as a positive sign of network decentralization and security. The Ethereum Foundation reports that over 29 million ETH is now staked, representing about 24% of the total supply. Despite lower yields, institutional interest in Ethereum staking continues to grow, with several major exchanges launching new staking products.',
    'Ethereum Insights',
    'https://example.com/eth-staking',
    NOW() - INTERVAL '4 hours',
    0.2,
    6,
    ARRAY['Ethereum', 'Staking', 'PoS', 'Network']
),
(
    'DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A major DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.',
    'The DeFi space has been rocked by another major exploit, with a prominent lending protocol losing approximately $50 million to hackers. The attack exploited a reentrancy vulnerability in the protocol''s smart contract, allowing the attacker to drain funds from multiple liquidity pools. The protocol team has acknowledged the exploit and is working with security firms and law enforcement to track the stolen funds. This incident highlights the ongoing security challenges in DeFi, where complex smart contracts can contain subtle vulnerabilities. The protocol has paused all operations and is conducting a thorough security audit. Users are advised to withdraw their funds once operations resume. The exploit has sent shockwaves through the DeFi community, with several other protocols conducting emergency security reviews.',
    'DeFi Security Watch',
    'https://example.com/defi-exploit',
    NOW() - INTERVAL '6 hours',
    -0.9,
    8,
    ARRAY['DeFi', 'Exploit', 'Security', 'Smart Contract']
),
(
    'Central Bank Digital Currency Pilot Program Shows Promising Results',
    'The Federal Reserve''s CBDC pilot program has completed its first phase, showing improved transaction efficiency and reduced settlement times.',
    'The Federal Reserve has released preliminary results from its Central Bank Digital Currency (CBDC) pilot program, showing significant improvements in transaction processing and settlement times. The six-month pilot, conducted in partnership with major financial institutions, processed over 1 million test transactions with an average settlement time of under 10 seconds. The digital dollar prototype demonstrated 99.9% uptime and successfully handled peak loads equivalent to Black Friday shopping volumes. Privacy features built into the system ensure transaction anonymity while maintaining compliance with anti-money laundering regulations. The Fed plans to expand the pilot program to include more participants and test cross-border transactions. However, concerns remain about the impact on commercial banks and the broader financial system.',
    'Federal Reserve News',
    'https://example.com/cbdc-pilot',
    NOW() - INTERVAL '8 hours',
    0.6,
    7,
    ARRAY['CBDC', 'Federal Reserve', 'Digital Dollar', 'Pilot']
),
(
    'NFT Market Shows Signs of Recovery with 40% Volume Increase',
    'The NFT marketplace has experienced a 40% increase in trading volume over the past month, suggesting a potential recovery from the prolonged bear market.',
    'The non-fungible token (NFT) market is showing signs of life after months of declining activity, with trading volumes increasing by 40% over the past month. This resurgence is attributed to the launch of several high-profile collections and renewed interest from collectors. OpenSea, the largest NFT marketplace, reported its highest daily volume in six months, with over $15 million in transactions. The recovery is being driven by utility-focused NFTs and gaming assets, rather than the speculative profile picture projects that dominated the 2021 boom. Several major brands have also re-entered the space, launching NFT collections tied to real-world benefits and experiences. While volumes remain well below peak levels, the sustained growth suggests the market may be finding its footing.',
    'NFT Market Report',
    'https://example.com/nft-recovery',
    NOW() - INTERVAL '10 hours',
    0.5,
    5,
    ARRAY['NFT', 'Recovery', 'OpenSea', 'Trading Volume']
),
(
    'Regulatory Clarity Boosts Crypto Adoption Among Traditional Banks',
    'New regulatory guidelines have provided the clarity banks needed to offer cryptocurrency services, leading to a surge in institutional adoption.',
    'The release of comprehensive cryptocurrency regulations has provided the clarity that traditional financial institutions have been seeking, resulting in a wave of new crypto service offerings. Major banks are now launching custody services, trading desks, and investment products for digital assets. The regulations establish clear guidelines for anti-money laundering compliance, customer protection, and capital requirements for crypto operations. JPMorgan Chase announced it will offer Bitcoin and Ethereum trading to institutional clients, while Bank of America is developing a cryptocurrency custody solution. The regulatory framework has also attracted new institutional investors, with pension funds and insurance companies beginning to allocate portions of their portfolios to digital assets. Industry experts predict this regulatory clarity will accelerate mainstream adoption and bring billions in new capital to the crypto market.',
    'Banking & Finance Today',
    'https://example.com/regulatory-clarity',
    NOW() - INTERVAL '12 hours',
    0.7,
    8,
    ARRAY['Regulation', 'Banks', 'Institutional', 'Compliance']
),
(
    'Layer 2 Solutions See Massive Growth as Ethereum Fees Remain High',
    'Ethereum Layer 2 networks have processed over $10 billion in transactions this month as users seek alternatives to high mainnet fees.',
    'Ethereum Layer 2 scaling solutions are experiencing unprecedented growth, with combined transaction volumes exceeding $10 billion this month. Arbitrum and Optimism lead the pack, processing millions of transactions daily at a fraction of mainnet costs. The surge in L2 adoption is driven by persistently high Ethereum gas fees, which have averaged over $20 per transaction during peak periods. Polygon has also seen significant growth, with several major DeFi protocols migrating to its network. The Layer 2 ecosystem now hosts over 200 decentralized applications, ranging from DeFi protocols to NFT marketplaces. Despite this growth, concerns remain about the fragmentation of liquidity across multiple networks and the complexity of bridging assets between layers. Ethereum''s upcoming upgrades aim to address these scalability issues, but Layer 2 solutions are likely to remain crucial for the network''s long-term success.',
    'Layer 2 Analytics',
    'https://example.com/layer2-growth',
    NOW() - INTERVAL '14 hours',
    0.4,
    6,
    ARRAY['Layer 2', 'Ethereum', 'Scaling', 'Gas Fees']
),
(
    'Crypto Mining Industry Faces Pressure from Environmental Concerns',
    'Environmental groups are increasing pressure on cryptocurrency miners to adopt renewable energy sources as climate concerns mount.',
    'The cryptocurrency mining industry is facing mounting pressure from environmental groups and regulators to reduce its carbon footprint and transition to renewable energy sources. A new report estimates that Bitcoin mining alone consumes as much electricity as a medium-sized country, raising concerns about its environmental impact. Several mining companies have announced commitments to achieve carbon neutrality by 2030, with some already operating entirely on renewable energy. The Sustainable Bitcoin Mining Council reports that 58% of the Bitcoin network now uses sustainable energy sources, up from 36% last year. However, critics argue that this progress is insufficient given the urgency of climate change. Some jurisdictions are considering restrictions on energy-intensive mining operations, while others are offering incentives for miners who use renewable energy. The industry is also exploring more energy-efficient consensus mechanisms and mining technologies to address these concerns.',
    'Environmental Crypto News',
    'https://example.com/mining-environment',
    NOW() - INTERVAL '16 hours',
    -0.3,
    7,
    ARRAY['Mining', 'Environment', 'Sustainability', 'Energy']
)
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
