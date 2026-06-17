import { NextRequest, NextResponse } from 'next/server';

/*
 * Portfolio analyzer API. Mirrors what the Suisei `sui_get_portfolio` tool
 * does under the hood: it fuses suix_getAllBalances + suix_getStakes from
 * the Sui mainnet fullnode into one wallet snapshot. Real on-chain data,
 * no key, read-only.
 */

const RPC = 'https://fullnode.mainnet.sui.io:443';
const SUI_TYPE = '0x2::sui::SUI';
const toSui = (mist: string | number | bigint) => Number(BigInt(mist)) / 1e9;

async function rpc(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result;
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || !/^0x[0-9a-fA-F]+$/.test(address)) {
      return NextResponse.json(
        { error: 'Enter a valid Sui address (0x...)' },
        { status: 400 }
      );
    }

    // Same two reads the sui_get_portfolio tool fuses.
    const [balances, stakes] = await Promise.all([
      rpc('suix_getAllBalances', [address]) as Promise<
        { coinType: string; totalBalance: string; coinObjectCount: number }[]
      >,
      rpc('suix_getStakes', [address]) as Promise<
        {
          validatorAddress: string;
          stakes: { principal: string; estimatedReward?: string; status: string }[];
        }[]
      >,
    ]);

    // Liquid SUI + other coins
    const suiBal = balances.find((b) => b.coinType === SUI_TYPE);
    const liquidSui = toSui(suiBal?.totalBalance ?? '0');
    const otherCoins = balances
      .filter((b) => b.coinType !== SUI_TYPE && BigInt(b.totalBalance) > 0n)
      .map((b) => ({
        symbol: b.coinType.split('::').pop() || 'TOKEN',
        amount: toSui(b.totalBalance).toFixed(4),
      }));

    // Stakes grouped by validator
    let stakedMist = 0n;
    let rewardMist = 0n;
    const stakeRows = stakes.map((v) => {
      let validatorPrincipal = 0n;
      let validatorReward = 0n;
      for (const s of v.stakes) {
        validatorPrincipal += BigInt(s.principal);
        validatorReward += BigInt(s.estimatedReward ?? '0');
      }
      stakedMist += validatorPrincipal;
      rewardMist += validatorReward;
      return {
        validatorAddress: v.validatorAddress,
        validatorName: `${v.validatorAddress.slice(0, 6)}…${v.validatorAddress.slice(-4)}`,
        amount: toSui(validatorPrincipal).toFixed(4),
        reward: toSui(validatorReward).toFixed(4),
      };
    });

    const totalExposure = liquidSui + toSui(stakedMist) + toSui(rewardMist);

    const portfolio = {
      address,
      totalBalance: totalExposure.toFixed(4),
      coins: [
        { symbol: 'SUI', amount: liquidSui.toFixed(4) },
        ...otherCoins,
      ],
      stakes: stakeRows,
      rewards: toSui(rewardMist).toFixed(4),
    };

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
