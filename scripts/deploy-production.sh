#!/bin/bash

# EverRise DEX Production Deployment Script
# This script deploys the smart contract to Solana mainnet

set -e  # Exit on any error

echo "🚀 Starting EverRise DEX Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Production addresses
TREASURY_WALLET="DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4"
EVER_MINT="3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8"
USDC_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

echo -e "${YELLOW}📋 Production Configuration:${NC}"
echo "Treasury Wallet: $TREASURY_WALLET"
echo "EVER Mint: $EVER_MINT"
echo "USDC Mint: $USDC_MINT"
echo ""

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install it first.${NC}"
    exit 1
fi

# Set to mainnet
echo -e "${YELLOW}🔧 Setting Solana cluster to mainnet-beta...${NC}"
solana config set --url https://api.mainnet-beta.solana.com

# Check wallet balance
echo -e "${YELLOW}💰 Checking wallet balance...${NC}"
BALANCE=$(solana balance)
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${RED}❌ Insufficient SOL balance. Need at least 2 SOL for deployment.${NC}"
    echo "Please fund your wallet and try again."
    exit 1
fi

# Navigate to program directory
cd programs/everrise-dex/everrise-dex

# Build the program
echo -e "${YELLOW}🔨 Building the program...${NC}"
anchor build

# Deploy to mainnet
echo -e "${YELLOW}🚀 Deploying to mainnet-beta...${NC}"
anchor deploy --provider.cluster mainnet-beta

# Get the program ID
PROGRAM_ID=$(solana address --keypair target/deploy/everrise_dex-keypair.json)
echo -e "${GREEN}✅ Program deployed successfully!${NC}"
echo -e "${GREEN}📋 Program ID: $PROGRAM_ID${NC}"

# Update the program ID in the source code
echo -e "${YELLOW}🔧 Updating program ID in source code...${NC}"
sed -i.bak "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/everrise-dex/src/lib.rs

# Rebuild with correct program ID
echo -e "${YELLOW}🔨 Rebuilding with correct program ID...${NC}"
anchor build

# Redeploy with correct program ID
echo -e "${YELLOW}🚀 Redeploying with correct program ID...${NC}"
anchor deploy --provider.cluster mainnet-beta

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📋 Next Steps:${NC}"
echo "1. Update render-production.yaml with the new program ID: $PROGRAM_ID"
echo "2. Initialize the bonding curve with 10,000 USDC and 100M EVER tokens"
echo "3. Deploy the frontend to Render.com"
echo "4. Test the complete deployment"

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save this program ID: $PROGRAM_ID${NC}"
echo -e "${YELLOW}⚠️  You'll need it for the frontend configuration.${NC}"
