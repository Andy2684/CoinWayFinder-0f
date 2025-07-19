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
    'Ethereum staking rewards have dropped to their lowest levels since the merge, indicating network maturity but concerning some validators.',
    'Ethereum''s proof-of-stake network is showing signs of maturation as staking rewards have declined to approximately 3.2% annually, the lowest since the successful merge in September 2022. This decrease is attributed to the growing number of validators joining the network, which now exceeds 900,000 active validators. While lower rewards might concern some stakers, network experts view this as a positive sign of Ethereum''s stability and security. The network''s total value locked in staking has surpassed 30 million ETH, worth over $75 billion at current prices. Despite lower yields, institutional interest in Ethereum staking continues to grow, with several major exchanges launching new staking services.',
    'Ethereum Insights',
    'https://example.com/eth-staking',
    NOW() - INTERVAL '4 hours',
    0.2,
    6,
    ARRAY['Ethereum', 'Staking', 'PoS', 'Validators']
),
(
    'Major DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A popular DeFi lending protocol has been exploited for $50 million due to a reentrancy vulnerability in its smart contract code.',
    'The DeFi space has been rocked by another major exploit, with YieldFarm Protocol losing approximately $50 million to hackers who exploited a reentrancy vulnerability in the platform''s lending smart contract. The attack occurred during a routine upgrade, where the hackers manipulated the protocol''s price oracle to drain funds from multiple liquidity pools. The protocol team has paused all operations and is working with blockchain security firms to assess the damage. This incident highlights the ongoing security challenges in DeFi, where complex smart contracts can contain subtle vulnerabilities. The exploit has caused the protocol''s native token to crash by 80%, and several other DeFi tokens have also declined on contagion fears. Users are advised to withdraw funds from similar protocols until security audits are completed.',
    'DeFi Security Watch',
    'https://example.com/defi-exploit',
    NOW() - INTERVAL '6 hours',
    -0.9,
    8,
    ARRAY['DeFi', 'Exploit', 'Security', 'Smart Contract']
),
(
    'Central Bank Digital Currency Pilot Program Shows Promising Results',
    'The Federal Reserve''s CBDC pilot program has completed its first phase with positive feedback from participating financial institutions.',
    'The Federal Reserve has announced promising results from the first phase of its Central Bank Digital Currency (CBDC) pilot program. The six-month trial involved 12 major banks and credit unions, processing over 1 million test transactions with an average settlement time of 2.3 seconds. Participants reported significant improvements in cross-border payments and reduced operational costs. The digital dollar prototype demonstrated 99.9% uptime and successfully handled peak loads of 100,000 transactions per second. However, privacy advocates have raised concerns about the potential for increased government surveillance. The Fed plans to expand the pilot to include retail transactions in the second phase, scheduled to begin next quarter. This development could significantly impact the cryptocurrency landscape, as CBDCs offer some benefits of digital currencies while maintaining government backing.',
    'Federal Reserve News',
    'https://example.com/cbdc-pilot',
    NOW() - INTERVAL '8 hours',
    0.4,
    7,
    ARRAY['CBDC', 'Federal Reserve', 'Digital Dollar', 'Banking']
) ON CONFLICT DO NOTHING;
