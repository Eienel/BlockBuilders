import { NextRequest, NextResponse } from 'next/server';
import { suiGetPortfolio } from '@suisei-mcp/mcp';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid Sui address' },
        { status: 400 }
      );
    }

    // Call the real Suisei tool
    const rawResult = await suiGetPortfolio({
      address,
      network: 'mainnet',
    });

    const result = JSON.parse(rawResult);

    // Transform to frontend format
    const portfolio = {
      address,
      totalBalance: result.summary.total_sui_exposure.toString(),
      coins: [
        {
          symbol: 'SUI',
          amount: result.summary.liquid_sui.toString(),
        },
        ...result.liquid.other_coins.map((coin: any) => ({
          symbol: coin.coin_type.split('::').pop(),
          amount: (Number(coin.total_mist) / 1e9).toString(),
        })),
      ],
      stakes: result.staked.validators.map((v: any) => ({
        validatorAddress: v.sui_address,
        validatorName: v.name || 'Validator',
        amount: v.staked_amount,
        apy: v.apy_percentage ? `${v.apy_percentage}%` : 'N/A',
      })),
      rewards: result.summary.reward_sui.toString(),
    };

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
