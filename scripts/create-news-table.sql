-- Create news_articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    source VARCHAR(100),
    url TEXT,
    sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score DECIMAL(3, 2) DEFAULT 0,
    symbols TEXT[] DEFAULT '{}',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_symbols ON news_articles USING GIN(symbols);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);

-- Insert sample news data
INSERT INTO news_articles (title, content, source, url, sentiment, sentiment_score, symbols, published_at) VALUES
('Bitcoin Reaches New All-Time High as Institutional Adoption Grows', 
 'Bitcoin has reached a new all-time high of $73,000 as institutional adoption continues to accelerate. Major corporations including MicroStrategy and Tesla have announced additional Bitcoin purchases for their treasury reserves.',
 'CryptoNews', 'https://example.com/bitcoin-ath', 'positive', 0.8, 
 ARRAY['BTC', 'Bitcoin'], NOW() - INTERVAL '2 hours'),

('Ethereum 2.0 Staking Rewards Increase Following Network Upgrade',
 'Following the successful implementation of the latest Ethereum network upgrade, staking rewards have increased by 15%. This improvement has attracted thousands of new validators.',
 'EthereumDaily', 'https://example.com/eth-staking', 'positive', 0.6,
 ARRAY['ETH', 'Ethereum'], NOW() - INTERVAL '4 hours'),

('Major Exchange Announces Support for New DeFi Protocols',
 'Binance has announced support for several new DeFi protocols, including advanced yield farming opportunities and liquidity mining programs.',
 'DeFiTimes', 'https://example.com/defi-support', 'positive', 0.4,
 ARRAY['DeFi', 'BNB'], NOW() - INTERVAL '6 hours'),

('Regulatory Clarity Boosts Crypto Market Confidence',
 'The Securities and Exchange Commission has released comprehensive guidelines for cryptocurrency operations, providing much-needed regulatory clarity.',
 'RegulatoryWatch', 'https://example.com/regulatory-clarity', 'positive', 0.7,
 ARRAY['BTC', 'ETH'], NOW() - INTERVAL '8 hours'),

('NFT Market Shows Signs of Recovery with New Use Cases',
 'After a period of decline, the NFT market is showing signs of recovery driven by innovative use cases in gaming, identity verification, and real-world asset tokenization.',
 'NFTInsider', 'https://example.com/nft-recovery', 'neutral', 0.3,
 ARRAY['NFT'], NOW() - INTERVAL '12 hours'),

('Central Bank Digital Currency Pilot Program Expands',
 'The Federal Reserve, European Central Bank, and Bank of Japan have all announced expansions to their Central Bank Digital Currency pilot programs.',
 'CentralBankNews', 'https://example.com/cbdc-pilot', 'neutral', 0.2,
 ARRAY['CBDC'], NOW() - INTERVAL '16 hours'),

('Crypto Mining Industry Shifts Toward Renewable Energy',
 'Leading cryptocurrency mining companies have announced significant investments in renewable energy infrastructure, addressing environmental concerns.',
 'GreenCrypto', 'https://example.com/green-mining', 'positive', 0.5,
 ARRAY['BTC'], NOW() - INTERVAL '20 hours'),

('Layer 2 Solutions See Massive Growth in Transaction Volume',
 'Polygon, Arbitrum, and Optimism have all reported record transaction volumes as users migrate to Layer 2 solutions for lower fees.',
 'Layer2News', 'https://example.com/layer2-growth', 'positive', 0.6,
 ARRAY['MATIC', 'ETH'], NOW() - INTERVAL '24 hours')

ON CONFLICT DO NOTHING;
