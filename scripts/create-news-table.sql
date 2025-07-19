-- Create news table with comprehensive schema
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(200) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    url VARCHAR(1000) UNIQUE NOT NULL,
    image_url VARCHAR(1000),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10) DEFAULT 5,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact_score ON news_articles(impact_score DESC);
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

-- Insert sample news data
INSERT INTO news_articles (title, summary, content, source, published_at, url, image_url, sentiment, impact_score, tags) VALUES
(
    'Bitcoin Reaches New All-Time High as Institutional Adoption Surges',
    'Bitcoin has broken through previous resistance levels, reaching a new all-time high of $73,000 as major institutions continue to add BTC to their balance sheets.',
    'Bitcoin''s remarkable rally continues as the world''s largest cryptocurrency by market capitalization has reached a new all-time high of $73,000. This surge comes amid growing institutional adoption, with several Fortune 500 companies announcing significant Bitcoin purchases for their treasury reserves. The rally has been fueled by increased demand from institutional investors, improved regulatory clarity, and growing acceptance of Bitcoin as a store of value. Market analysts suggest that this could be the beginning of a new bull cycle, with some predicting Bitcoin could reach $100,000 by the end of the year. The surge has also positively impacted the broader cryptocurrency market, with Ethereum and other major altcoins experiencing significant gains.',
    'CryptoNews Daily',
    NOW() - INTERVAL '2 hours',
    'https://example.com/bitcoin-ath-1',
    '/placeholder.svg?height=200&width=400&text=Bitcoin+ATH',
    'positive',
    9,
    ARRAY['Bitcoin', 'ATH', 'Institutional', 'Bull Market']
),
(
    'Ethereum 2.0 Staking Rewards Hit Record Low as Network Matures',
    'Ethereum staking rewards have dropped to historic lows as the network becomes more decentralized and efficient, signaling maturation of the proof-of-stake consensus.',
    'Ethereum''s transition to proof-of-stake has reached a new milestone as staking rewards have hit record lows, dropping below 3% APR for the first time since the merge. This decline in rewards is actually a positive indicator of network health, as it demonstrates increased participation in staking and improved network security. With over 32 million ETH now staked, representing approximately 26% of the total supply, the network has achieved unprecedented decentralization. Lower rewards also indicate reduced inflation pressure on ETH, potentially making it more attractive as a store of value. Despite lower staking yields, institutional interest in Ethereum staking continues to grow, with several major financial institutions launching Ethereum staking services for their clients.',
    'Ethereum Foundation',
    NOW() - INTERVAL '4 hours',
    'https://example.com/ethereum-staking-1',
    '/placeholder.svg?height=200&width=400&text=Ethereum+Staking',
    'neutral',
    6,
    ARRAY['Ethereum', 'Staking', 'PoS', 'Network']
),
(
    'Major DeFi Protocol Suffers $50M Exploit Due to Smart Contract Vulnerability',
    'A popular DeFi lending protocol has been exploited for $50 million due to a critical smart contract vulnerability, highlighting ongoing security challenges in decentralized finance.',
    'The DeFi space has been rocked by another major exploit as a leading lending protocol lost $50 million to hackers who exploited a critical vulnerability in the platform''s smart contract code. The attack occurred during a routine protocol upgrade, where attackers identified and exploited a reentrancy vulnerability that allowed them to drain funds from the protocol''s liquidity pools. This incident marks the largest DeFi hack of the year and has reignited discussions about the security challenges facing decentralized finance. The protocol''s team has acknowledged the exploit and is working with security firms and law enforcement to track the stolen funds. Users are advised to withdraw their funds from the platform while the team works on implementing additional security measures. This incident serves as a stark reminder of the risks associated with DeFi protocols and the importance of thorough security audits.',
    'DeFi Security Watch',
    NOW() - INTERVAL '6 hours',
    'https://example.com/defi-exploit-1',
    '/placeholder.svg?height=200&width=400&text=DeFi+Exploit',
    'negative',
    8,
    ARRAY['DeFi', 'Security', 'Exploit', 'Smart Contracts']
),
(
    'Central Bank Digital Currency Pilots Show Promising Results Across Multiple Countries',
    'Several central banks report positive outcomes from their CBDC pilot programs, with improved transaction efficiency and financial inclusion being key benefits.',
    'Central Bank Digital Currencies (CBDCs) are gaining momentum as pilot programs across multiple countries show promising results. The Bank of England, European Central Bank, and People''s Bank of China have all reported positive outcomes from their respective digital currency trials. Key benefits identified include faster cross-border payments, improved financial inclusion for unbanked populations, and enhanced monetary policy transmission. The digital yuan pilot in China has processed over $13 billion in transactions, while the EU''s digital euro project has successfully completed its investigation phase. However, concerns about privacy and the potential impact on commercial banks remain significant challenges that need to be addressed before full-scale implementation. Central banks are working closely with technology partners and regulatory bodies to ensure that CBDCs can coexist with existing financial infrastructure while providing the benefits of digital currencies.',
    'Central Banking Today',
    NOW() - INTERVAL '8 hours',
    'https://example.com/cbdc-pilots-1',
    '/placeholder.svg?height=200&width=400&text=CBDC+Pilots',
    'positive',
    7,
    ARRAY['CBDC', 'Central Banks', 'Digital Currency', 'Regulation']
),
(
    'NFT Market Shows Signs of Recovery with New Utility-Focused Projects',
    'The NFT market is experiencing renewed interest as projects focus on utility and real-world applications rather than speculative trading.',
    'After a prolonged bear market, the NFT space is showing signs of recovery as new projects focus on utility and real-world applications rather than purely speculative assets. Gaming NFTs, digital identity solutions, and tokenized real estate are leading the recovery, with trading volumes up 40% over the past month. Major brands are also re-entering the space with more sophisticated approaches, focusing on customer engagement and loyalty programs rather than quick cash grabs. The shift towards utility-driven NFTs has attracted institutional investors who previously avoided the space due to its speculative nature. Educational institutions are also exploring NFTs for credential verification, while artists are using the technology to create new forms of interactive digital art. This evolution suggests that the NFT market is maturing beyond the initial hype cycle and finding sustainable use cases that provide genuine value to users.',
    'NFT Insider',
    NOW() - INTERVAL '12 hours',
    'https://example.com/nft-recovery-1',
    '/placeholder.svg?height=200&width=400&text=NFT+Recovery',
    'positive',
    5,
    ARRAY['NFT', 'Utility', 'Gaming', 'Digital Art']
),
(
    'Regulatory Clarity Emerges as Multiple Jurisdictions Finalize Crypto Frameworks',
    'Several major jurisdictions have finalized comprehensive cryptocurrency regulatory frameworks, providing much-needed clarity for businesses and investors.',
    'The cryptocurrency industry is celebrating a wave of regulatory clarity as multiple major jurisdictions have finalized comprehensive frameworks for digital assets. The European Union''s Markets in Crypto-Assets (MiCA) regulation has officially come into effect, providing clear guidelines for crypto businesses operating within the EU. Similarly, the UK has published its final rules for crypto asset activities, while Singapore has updated its Payment Services Act to include detailed provisions for digital payment tokens. These regulatory developments are being welcomed by industry participants who have long called for clear rules of engagement. The new frameworks address key areas including consumer protection, anti-money laundering requirements, and operational standards for crypto exchanges and service providers. Industry experts believe that this regulatory clarity will pave the way for increased institutional adoption and mainstream acceptance of cryptocurrencies.',
    'Regulatory Affairs Weekly',
    NOW() - INTERVAL '18 hours',
    'https://example.com/crypto-regulation-1',
    '/placeholder.svg?height=200&width=400&text=Crypto+Regulation',
    'positive',
    8,
    ARRAY['Regulation', 'MiCA', 'Compliance', 'Legal']
),
(
    'Layer 2 Solutions See Massive Growth as Ethereum Gas Fees Remain High',
    'Ethereum Layer 2 scaling solutions are experiencing unprecedented growth as users seek alternatives to high mainnet transaction fees.',
    'Ethereum Layer 2 scaling solutions are experiencing explosive growth as users and developers migrate to avoid high mainnet transaction fees. Arbitrum, Optimism, and Polygon have all reported record-breaking transaction volumes and total value locked (TVL) in recent weeks. The combined TVL across major Layer 2 networks has surpassed $15 billion, representing a 300% increase from the beginning of the year. This growth is being driven by both retail users seeking cheaper transactions and DeFi protocols expanding their presence across multiple chains. Major decentralized exchanges like Uniswap and SushiSwap have seen significant volume migration to Layer 2 networks, where users can trade with fees as low as a few cents compared to $20-50 on Ethereum mainnet. The success of Layer 2 solutions is also attracting institutional attention, with several major financial institutions exploring partnerships with Layer 2 protocols to offer their clients access to DeFi services at scale.',
    'Layer 2 Analytics',
    NOW() - INTERVAL '24 hours',
    'https://example.com/layer2-growth-1',
    '/placeholder.svg?height=200&width=400&text=Layer+2+Growth',
    'positive',
    7,
    ARRAY['Layer 2', 'Scaling', 'Arbitrum', 'Optimism']
),
(
    'Crypto Mining Industry Faces Pressure from Environmental Concerns and Energy Costs',
    'The cryptocurrency mining industry is under increasing pressure from environmental activists and rising energy costs, forcing miners to seek sustainable solutions.',
    'The cryptocurrency mining industry is facing mounting pressure from multiple fronts as environmental concerns and rising energy costs force miners to reconsider their operations. Several major mining companies have announced plans to transition to renewable energy sources, with some committing to achieving carbon neutrality by 2030. The pressure comes not only from environmental activists but also from investors and regulators who are increasingly focused on ESG (Environmental, Social, and Governance) criteria. Rising electricity costs in key mining regions have also made operations less profitable, particularly for smaller miners using older, less efficient equipment. In response, the industry is seeing increased investment in renewable energy infrastructure, with some mining companies partnering with solar and wind energy providers to secure long-term, sustainable power sources. Additionally, there''s growing interest in alternative consensus mechanisms and more energy-efficient mining technologies that could reduce the environmental impact of cryptocurrency networks.',
    'Mining Industry Report',
    NOW() - INTERVAL '30 hours',
    'https://example.com/mining-environment-1',
    '/placeholder.svg?height=200&width=400&text=Crypto+Mining',
    'negative',
    6,
    ARRAY['Mining', 'Environment', 'ESG', 'Sustainability']
);

-- Create view for news analytics
CREATE OR REPLACE VIEW news_analytics AS
SELECT 
    sentiment,
    COUNT(*) as article_count,
    AVG(impact_score) as avg_impact_score,
    MAX(published_at) as latest_article
FROM news_articles 
GROUP BY sentiment;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_news(search_query TEXT)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(500),
    summary TEXT,
    content TEXT,
    source VARCHAR(200),
    published_at TIMESTAMP WITH TIME ZONE,
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    sentiment VARCHAR(20),
    impact_score INTEGER,
    tags TEXT[],
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
        n.url,
        n.image_url,
        n.sentiment,
        n.impact_score,
        n.tags,
        ts_rank(to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content), plainto_tsquery('english', search_query)) as rank
    FROM news_articles n
    WHERE to_tsvector('english', n.title || ' ' || n.summary || ' ' || n.content) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, n.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON news_articles TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE news_articles_id_seq TO your_app_user;
-- GRANT SELECT ON news_analytics TO your_app_user;
-- GRANT EXECUTE ON FUNCTION search_news(TEXT) TO your_app_user;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_title_gin ON news_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_news_summary_gin ON news_articles USING GIN(to_tsvector('english', summary));

-- Analyze table for query optimization
ANALYZE news_articles;

COMMIT;
