-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    source VARCHAR(100),
    url VARCHAR(1000),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    impact_score INTEGER DEFAULT 5,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_articles(impact_score);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN(tags);

-- Insert sample data
INSERT INTO news_articles (title, summary, content, source, url, published_at, sentiment_score, impact_score, tags) VALUES
('Bitcoin Reaches New All-Time High Above $75,000', 
 'Bitcoin surged to unprecedented levels as institutional adoption continues to drive demand.',
 'Bitcoin has reached a new all-time high above $75,000, marking a significant milestone in the cryptocurrency''s journey. The surge comes amid increased institutional adoption and growing acceptance of Bitcoin as a store of value. Major corporations continue to add Bitcoin to their treasury reserves, while regulatory clarity in key markets has boosted investor confidence.',
 'CryptoNews', 
 'https://example.com/bitcoin-ath',
 NOW() - INTERVAL '2 hours',
 0.8, 
 9, 
 ARRAY['Bitcoin', 'ATH', 'Institutional']),

('Ethereum 2.0 Staking Rewards Hit Record Levels',
 'Ethereum staking yields reach new highs as network activity surges post-merge.',
 'Ethereum staking rewards have reached record levels following increased network activity and successful implementation of various protocol upgrades. The proof-of-stake consensus mechanism continues to attract validators, with over 32 million ETH now staked on the network.',
 'EthereumDaily',
 'https://example.com/eth-staking',
 NOW() - INTERVAL '4 hours',
 0.7,
 7,
 ARRAY['Ethereum', 'Staking', 'DeFi']),

('Major Exchange Faces Regulatory Scrutiny',
 'Regulatory authorities launch investigation into trading practices at major cryptocurrency exchange.',
 'A major cryptocurrency exchange is facing increased regulatory scrutiny as authorities investigate potential violations of trading regulations. The investigation focuses on market manipulation concerns and compliance with anti-money laundering requirements.',
 'RegulatorWatch',
 'https://example.com/exchange-scrutiny',
 NOW() - INTERVAL '6 hours',
 -0.6,
 8,
 ARRAY['Regulation', 'Exchange', 'Compliance']),

('DeFi Protocol Launches Revolutionary Yield Farming Feature',
 'New DeFi protocol introduces innovative yield farming mechanism with enhanced security features.',
 'A groundbreaking DeFi protocol has launched a revolutionary yield farming feature that promises higher returns with enhanced security measures. The protocol utilizes advanced smart contract architecture and multi-signature security to protect user funds.',
 'DeFiInsider',
 'https://example.com/defi-yield',
 NOW() - INTERVAL '8 hours',
 0.5,
 6,
 ARRAY['DeFi', 'Yield Farming', 'Innovation']),

('NFT Market Shows Signs of Recovery',
 'NFT trading volumes increase significantly as market sentiment improves.',
 'The NFT market is showing strong signs of recovery with trading volumes increasing by over 200% in the past month. Blue-chip collections are leading the recovery, with floor prices stabilizing and new projects gaining traction.',
 'NFTTracker',
 'https://example.com/nft-recovery',
 NOW() - INTERVAL '12 hours',
 0.4,
 5,
 ARRAY['NFT', 'Recovery', 'Trading']),

('Central Bank Digital Currency Pilot Program Expands',
 'Major central bank expands CBDC pilot program to include more participants and use cases.',
 'A major central bank has announced the expansion of its Central Bank Digital Currency (CBDC) pilot program, adding more participants and exploring additional use cases. The expanded pilot will test cross-border payments and programmable money features.',
 'CentralBankNews',
 'https://example.com/cbdc-expansion',
 NOW() - INTERVAL '16 hours',
 0.3,
 7,
 ARRAY['CBDC', 'Central Bank', 'Digital Currency']),

('Crypto Mining Difficulty Reaches New Peak',
 'Bitcoin mining difficulty adjusts upward as network hashrate continues to grow.',
 'Bitcoin mining difficulty has reached a new all-time high following the latest difficulty adjustment. The increase reflects the growing network hashrate as more miners join the network, demonstrating the robust security and decentralization of the Bitcoin network.',
 'MiningReport',
 'https://example.com/mining-difficulty',
 NOW() - INTERVAL '20 hours',
 0.2,
 4,
 ARRAY['Mining', 'Bitcoin', 'Network Security']),

('Altcoin Season Indicators Flash Mixed Signals',
 'Market analysts debate whether current conditions indicate the start of altcoin season.',
 'Market analysts are divided on whether current market conditions indicate the beginning of altcoin season. While some altcoins have shown strong performance relative to Bitcoin, others remain subdued. Key indicators are sending mixed signals.',
 'AltcoinAnalysis',
 'https://example.com/altcoin-season',
 NOW() - INTERVAL '24 hours',
 0.1,
 6,
 ARRAY['Altcoins', 'Market Analysis', 'Trading'])

ON CONFLICT DO NOTHING;
