import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

async function callMcpTool(tool: string, args: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const mcp = spawn('npx', ['-y', '@suisei-mcp/mcp'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });

    let output = '';
    let error = '';

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      error += data.toString();
    });

    mcp.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`MCP error: ${error || output}`));
      }
    });

    // Send JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: tool,
        arguments: args,
      },
    };

    mcp.stdin.write(JSON.stringify(request) + '\n');
    mcp.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid Sui address' },
        { status: 400 }
      );
    }

    // Call the real Suisei MCP tool
    const result = await callMcpTool('sui_get_portfolio', {
      address,
      network: 'mainnet',
    });

    const parsed = JSON.parse(result);

    // Transform response for frontend
    const portfolio = {
      address,
      totalBalance: parsed.summary?.total_sui_exposure || '0',
      coins:
        parsed.liquid?.other_coins?.map((coin: any) => ({
          symbol: coin.coin_type.split('::').pop() || 'UNKNOWN',
          amount: (Number(coin.total_mist) / 1e9).toFixed(2),
        })) || [],
      stakes:
        parsed.staked?.validators?.map((v: any) => ({
          validatorAddress: v.sui_address,
          validatorName: v.name || 'Validator',
          amount: v.staked_amount,
          apy: v.apy_percentage,
        })) || [],
      rewards: parsed.summary?.reward_sui || '0',
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
