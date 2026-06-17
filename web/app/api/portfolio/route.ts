import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid Sui address' },
        { status: 400 }
      );
    }

    // Mock portfolio data for demo
    // In production, this would call the actual Suisei MCP tool
    const mockPortfolio = {
      address,
      totalBalance: '57.34',
      coins: [
        { symbol: 'SUI', amount: '47.34', usdValue: '$237' },
        { symbol: 'USDC', amount: '10', usdValue: '$10' },
      ],
      stakes: [
        {
          validatorAddress: '0xvalidator1',
          validatorName: 'MyValidators',
          amount: '50',
          apy: '3.2%',
        },
      ],
      rewards: '0.823',
    };

    return NextResponse.json(mockPortfolio);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
