-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    source VARCHAR(200),
    sentiment DECIMAL(3,2) DEFAULT 0,
    impact INTEGER DEFAULT 5 CHECK (impact >= 1 AND impact <= 10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    url VARCHAR(1000),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_timestamp ON news_articles(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_articles(impact);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);

-- Insert sample data
INSERT INTO news_articles (title, summary, content, source, sentiment, impact, timestamp, url, tags) VALUES
(
    'Bitcoin Reaches New All-Time High Above $75,000',
    'Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.',
    'Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency''s journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence. Technical analysis suggests strong momentum with key resistance levels being broken decisively.',
    'CryptoNews Daily',
    0.8,
    9,
    NOW() - INTERVAL '2 hours',
    'https://example.com/bitcoin-ath',
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bullish']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Levels',
    'Ethereum validators are seeing unprecedented returns as network activity surges.',
    'Ethereum 2.0 validators are experiencing record-high staking rewards as network activity reaches new peaks. The combination of increased transaction fees and MEV (Maximum Extractable Value) opportunities has pushed annual percentage yields above 8% for many validators. This surge in rewards comes as Ethereum continues to dominate the DeFi and NFT spaces, driving consistent demand for block space and higher fee revenues.',
    'DeFi Analytics',
    0.7,
    7,
    NOW() - INTERVAL '4 hours',
    'https://example.com/eth-staking',
    ARRAY['Ethereum', 'Staking', 'DeFi', 'Rewards']
),
(
    'Major Exchange Hack Results in $200M Loss',
    'A sophisticated attack on a major cryptocurrency exchange has resulted in significant losses.',
    'A major cryptocurrency exchange has fallen victim to a sophisticated hack, resulting in the loss of approximately $200 million in various cryptocurrencies. The attack appears to have exploited a vulnerability in the exchange''s hot wallet infrastructure. The exchange has immediately suspended all withdrawals and is working with cybersecurity firms and law enforcement to investigate the breach. Users are advised to change their passwords and enable additional security measures.',
    'Security Alert Network',
    -0.9,
    8,
    NOW() - INTERVAL '6 hours',
    'https://example.com/exchange-hack',
    ARRAY['Security', 'Hack', 'Exchange', 'Risk']
),
(
    'Central Bank Digital Currency Pilot Program Launches',
    'A major central bank has announced the launch of its CBDC pilot program.',
    'The Federal Reserve has officially launched its Central Bank Digital Currency (CBDC) pilot program, marking a significant step toward digital currency adoption at the institutional level. The pilot will test various use cases including cross-border payments, retail transactions, and interbank settlements. This development could have far-reaching implications for the broader cryptocurrency ecosystem and traditional banking infrastructure.',
    'Financial Times Crypto',
    0.3,
    6,
    NOW() - INTERVAL '8 hours',
    'https://example.com/cbdc-pilot',
    ARRAY['CBDC', 'Federal Reserve', 'Digital Currency', 'Regulation']
),
(
    'DeFi Protocol Introduces Revolutionary Yield Farming',
    'A new DeFi protocol promises sustainable high yields through innovative mechanisms.',
    'A groundbreaking DeFi protocol has launched with a revolutionary approach to yield farming that promises sustainable high returns without the typical risks associated with liquidity mining. The protocol uses a novel algorithmic approach to balance supply and demand, automatically adjusting rewards based on market conditions. Early adopters are reporting yields of 15-25% APY with significantly reduced impermanent loss risk.',
    'DeFi Pulse',
    0.6,
    5,
    NOW() - INTERVAL '12 hours',
    'https://example.com/defi-yield',
    ARRAY['DeFi', 'Yield Farming', 'Innovation', 'APY']
),
(
    'NFT Market Shows Signs of Recovery',
    'Trading volumes and floor prices are rising across major NFT collections.',
    'The NFT market is showing strong signs of recovery after months of declining activity. Major collections like CryptoPunks and Bored Ape Yacht Club have seen significant increases in floor prices and trading volumes. New utility-focused projects are gaining traction, suggesting a shift toward more sustainable NFT ecosystems. Gaming and metaverse applications continue to drive adoption and create real-world value for digital assets.',
    'NFT Tracker',
    0.5,
    4,
    NOW() - INTERVAL '18 hours',
    'https://example.com/nft-recovery',
    ARRAY['NFT', 'Recovery', 'Gaming', 'Metaverse']
),
(
    'Regulatory Clarity Boosts Institutional Adoption',
    'New regulatory guidelines provide clearer framework for institutional crypto investments.',
    'Recent regulatory developments have provided much-needed clarity for institutional investors looking to enter the cryptocurrency space. The new guidelines establish clear frameworks for custody, reporting, and compliance requirements. This regulatory clarity is expected to accelerate institutional adoption, with several major pension funds and endowments already announcing plans to allocate portions of their portfolios to digital assets.',
    'Institutional Crypto Report',
    0.7,
    7,
    NOW() - INTERVAL '1 day',
    'https://example.com/regulatory-clarity',
    ARRAY['Regulation', 'Institutional', 'Compliance', 'Adoption']
),
(
    'Layer 2 Solutions See Massive Growth in Usage',
    'Ethereum Layer 2 networks are processing record transaction volumes.',
    'Ethereum Layer 2 solutions are experiencing unprecedented growth, with combined transaction volumes exceeding those of the main Ethereum network for the first time. Arbitrum, Optimism, and Polygon are leading the charge, offering users significantly lower fees and faster transaction times. This growth is driving innovation in DeFi applications and making Ethereum-based services more accessible to retail users worldwide.',
    'Layer 2 Analytics',
    0.8,
    6,
    NOW() - INTERVAL '30 hours',
    'https://example.com/layer2-growth',
    ARRAY['Layer 2', 'Scaling', 'Ethereum', 'Growth']
)
ON CONFLICT DO NOTHING;
