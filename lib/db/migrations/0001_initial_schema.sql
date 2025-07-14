CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(20),
	"location" varchar(100),
	"website" varchar(255),
	"bio" text,
	"timezone" varchar(50) DEFAULT 'UTC',
	"avatar" text,
	"role" varchar(20) DEFAULT 'user',
	"plan" varchar(20) DEFAULT 'free',
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"preferences" jsonb DEFAULT '{}',
	"security_settings" jsonb DEFAULT '{}',
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- Signals table
CREATE TABLE IF NOT EXISTS "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"type" varchar(10) NOT NULL,
	"strategy" varchar(50) NOT NULL,
	"exchange" varchar(50) NOT NULL,
	"timeframe" varchar(10) NOT NULL,
	"confidence" integer NOT NULL,
	"entry_price" numeric(20, 8) NOT NULL,
	"target_price" numeric(20, 8) NOT NULL,
	"stop_loss" numeric(20, 8) NOT NULL,
	"current_price" numeric(20, 8) NOT NULL,
	"pnl" numeric(20, 8) DEFAULT '0',
	"pnl_percentage" numeric(10, 4) DEFAULT '0',
	"progress" integer DEFAULT 0,
	"risk_level" varchar(10) NOT NULL,
	"ai_analysis" text,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);

-- Bots table
CREATE TABLE IF NOT EXISTS "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"strategy" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'INACTIVE',
	"pair" varchar(20) NOT NULL,
	"exchange" varchar(50) NOT NULL,
	"profit" numeric(20, 8) DEFAULT '0',
	"total_trades" integer DEFAULT 0,
	"win_rate" numeric(5, 2) DEFAULT '0',
	"max_drawdown" numeric(10, 4) DEFAULT '0',
	"sharpe_ratio" numeric(10, 4) DEFAULT '0',
	"config" jsonb NOT NULL,
	"risk_settings" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_run_at" timestamp
);

-- News table
CREATE TABLE IF NOT EXISTS "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"source" varchar(100) NOT NULL,
	"author" varchar(100),
	"url" text,
	"image_url" text,
	"category" varchar(50),
	"sentiment" varchar(20),
	"sentiment_score" numeric(5, 4),
	"impact" varchar(20),
	"tags" jsonb DEFAULT '[]',
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Alert rules table
CREATE TABLE IF NOT EXISTS "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"condition" varchar(50) NOT NULL,
	"symbol" varchar(20),
	"value" numeric(20, 8) NOT NULL,
	"operator" varchar(5) NOT NULL,
	"enabled" boolean DEFAULT true,
	"channels" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"triggered_at" timestamp,
	"status" varchar(20) DEFAULT 'ACTIVE'
);

-- Exchange integrations table
CREATE TABLE IF NOT EXISTS "exchange_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"exchange_name" varchar(50) NOT NULL,
	"api_key" text NOT NULL,
	"api_secret" text NOT NULL,
	"passphrase" text,
	"sandbox" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'DISCONNECTED',
	"permissions" jsonb DEFAULT '[]',
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Bot trades table
CREATE TABLE IF NOT EXISTS "bot_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"type" varchar(10) NOT NULL,
	"side" varchar(10) NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"fee" numeric(20, 8) DEFAULT '0',
	"pnl" numeric(20, 8) DEFAULT '0',
	"exchange" varchar(50) NOT NULL,
	"order_id" varchar(100),
	"executed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign key constraints
ALTER TABLE "signals" ADD CONSTRAINT "signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bots" ADD CONSTRAINT "bots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "exchange_integrations" ADD CONSTRAINT "exchange_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bot_trades" ADD CONSTRAINT "bot_trades_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bot_trades" ADD CONSTRAINT "bot_trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "signals_user_id_idx" ON "signals" ("user_id");
CREATE INDEX IF NOT EXISTS "signals_symbol_idx" ON "signals" ("symbol");
CREATE INDEX IF NOT EXISTS "signals_status_idx" ON "signals" ("status");
CREATE INDEX IF NOT EXISTS "signals_created_at_idx" ON "signals" ("created_at");
CREATE INDEX IF NOT EXISTS "bots_user_id_idx" ON "bots" ("user_id");
CREATE INDEX IF NOT EXISTS "bots_status_idx" ON "bots" ("status");
CREATE INDEX IF NOT EXISTS "bots_pair_idx" ON "bots" ("pair");
CREATE INDEX IF NOT EXISTS "news_source_idx" ON "news" ("source");
CREATE INDEX IF NOT EXISTS "news_category_idx" ON "news" ("category");
CREATE INDEX IF NOT EXISTS "news_published_at_idx" ON "news" ("published_at");
CREATE INDEX IF NOT EXISTS "news_sentiment_idx" ON "news" ("sentiment");
CREATE INDEX IF NOT EXISTS "alert_rules_user_id_idx" ON "alert_rules" ("user_id");
CREATE INDEX IF NOT EXISTS "alert_rules_enabled_idx" ON "alert_rules" ("enabled");
CREATE INDEX IF NOT EXISTS "alert_rules_status_idx" ON "alert_rules" ("status");
CREATE INDEX IF NOT EXISTS "exchange_integrations_user_id_idx" ON "exchange_integrations" ("user_id");
CREATE INDEX IF NOT EXISTS "exchange_integrations_exchange_name_idx" ON "exchange_integrations" ("exchange_name");
CREATE INDEX IF NOT EXISTS "exchange_integrations_status_idx" ON "exchange_integrations" ("status");
CREATE INDEX IF NOT EXISTS "bot_trades_bot_id_idx" ON "bot_trades" ("bot_id");
CREATE INDEX IF NOT EXISTS "bot_trades_user_id_idx" ON "bot_trades" ("user_id");
CREATE INDEX IF NOT EXISTS "bot_trades_symbol_idx" ON "bot_trades" ("symbol");
CREATE INDEX IF NOT EXISTS "bot_trades_executed_at_idx" ON "bot_trades" ("executed_at");
