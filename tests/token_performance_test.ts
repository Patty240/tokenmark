import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.2/index.ts';
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "add-token-performance: Successfully add performance for a new token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const tokenSymbol = 'BTC';
    const block = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(50000),
        types.uint(1000000),
        types.uint(1000000000),
        types.list([types.uint(49000), types.uint(50000), types.uint(51000)])
      ], deployer.address)
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify token was added to tracked tokens
    const tokensList = chain.callReadOnlyFn('token_performance', 'get-all-tokens', [], deployer.address);
    tokensList.result.expectList().includes(tokenSymbol);

    // Verify token performance data
    const performance = chain.callReadOnlyFn('token_performance', 'get-token-performance', [types.ascii(tokenSymbol)], deployer.address);
    performance.result.expectSome();
  }
});

Clarinet.test({
  name: "add-token-performance: Update performance for an existing token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const tokenSymbol = 'ETH';
    const initialBlock = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(3000),
        types.uint(500000),
        types.uint(500000000),
        types.list([types.uint(2900), types.uint(3000), types.uint(3100)])
      ], deployer.address)
    ]);

    initialBlock.receipts[0].result.expectOk();

    const updateBlock = chain.mineBlock([
      Tx.contractCall('token_performance', 'update-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(3500),
        types.uint(600000),
        types.uint(600000000),
        types.list([types.uint(3400), types.uint(3500), types.uint(3600)])
      ], deployer.address)
    ]);

    updateBlock.receipts[0].result.expectOk();

    const updatedPerformance = chain.callReadOnlyFn('token_performance', 'get-token-performance', [types.ascii(tokenSymbol)], deployer.address);
    const performanceData = updatedPerformance.result.expectSome();
    performanceData['price'].expectUint(3500);
  }
});

Clarinet.test({
  name: "add-token-performance: Prevent non-owner from adding/updating performance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const attacker = accounts.get('wallet_1')!;
    const tokenSymbol = 'DOGE';
    
    const block = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(1),
        types.uint(1),
        types.uint(1),
        types.list([types.uint(1)])
      ], attacker.address)
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  }
});

Clarinet.test({
  name: "add-token-performance: Validate input validation (reject zero or negative values)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const tokenSymbol = 'BAD';
    
    const block = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(0),
        types.uint(0),
        types.uint(0),
        types.list([types.uint(0)])
      ], deployer.address)
    ]);

    block.receipts[0].result.expectErr().expectUint(400);
  }
});

Clarinet.test({
  name: "Token Tracking List - Verify Growth and Limit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Add 100 unique tokens to test list limit
    const tokenBlocks = Array(100).fill(0).map((_, index) => {
      return Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(`TOKEN${index}`),
        types.uint(100 + index),
        types.uint(1000 + index),
        types.uint(10000 + index),
        types.list([types.uint(100 + index)])
      ], deployer.address);
    });

    const block = chain.mineBlock(tokenBlocks);
    
    // Verify 100 tokens were added successfully
    const tokensList = chain.callReadOnlyFn('token_performance', 'get-all-tokens', [], deployer.address);
    tokensList.result.expectList().length === 100;

    // Attempt to add 101st token should fail
    const overflowBlock = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii('OVERFLOW'),
        types.uint(1),
        types.uint(1),
        types.uint(1),
        types.list([types.uint(1)])
      ], deployer.address)
    ]);

    overflowBlock.receipts[0].result.expectErr().expectUint(403);
  }
});

Clarinet.test({
  name: "get-token-performance: Retrieve and handle token retrievals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const tokenSymbol = 'LINK';
    
    // First, add a token
    const addBlock = chain.mineBlock([
      Tx.contractCall('token_performance', 'add-token-performance', [
        types.ascii(tokenSymbol),
        types.uint(10),
        types.uint(1000),
        types.uint(10000),
        types.list([types.uint(9), types.uint(10), types.uint(11)])
      ], deployer.address)
    ]);

    addBlock.receipts[0].result.expectOk();

    // Retrieve existing token
    const existingToken = chain.callReadOnlyFn('token_performance', 'get-token-performance', [types.ascii(tokenSymbol)], deployer.address);
    existingToken.result.expectSome();

    // Retrieve non-existent token
    const nonExistentToken = chain.callReadOnlyFn('token_performance', 'get-token-performance', [types.ascii('FAKE')], deployer.address);
    nonExistentToken.result.expectNone();
  }
});