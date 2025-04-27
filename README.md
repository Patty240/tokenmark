# tokenmark

## Project Overview

**tokenmark** is a Stacks blockchain platform for tracking and analyzing token performance metrics securely and transparently.

The project provides a Clarity smart contract for securely storing and retrieving token performance data, including price, 24-hour volume, market cap, and historical prices. This allows users to track and analyze token performance in a decentralized manner on the Stacks blockchain.

## Contract Architecture

The main component of the project is the `token_performance.clar` contract, which manages the storage and retrieval of token performance metrics.

### Data Structures
- **Token Performance Map**: Stores the performance data for each tracked token, including price, 24-hour volume, market cap, and historical prices.
- **Tracked Tokens List**: Maintains a list of all the tokens being tracked in the contract.

### Public Functions
- `add-token-performance`: Allows the contract owner to add a new token's performance metrics to the contract.
- `update-token-performance`: Allows the contract owner to update an existing token's performance metrics.
- `get-token-performance`: Allows anyone to retrieve the performance metrics for a specific token.
- `get-all-tokens`: Allows anyone to retrieve the list of all tracked tokens.

The contract includes input validation, authorization checks, and error handling to ensure the integrity and security of the data.

## Installation & Setup

### Prerequisites
- [Clarinet](https://www.clarinet.dev/), a development environment for Clarity smart contracts.

### Installation Steps
1. Clone the repository: `git clone https://github.com/username/tokenmark.git`
2. Navigate to the project directory: `cd tokenmark`
3. Install dependencies: `clarinet install`

### Configuration
The project includes Clarinet configuration files for different Stacks blockchain environments (Devnet, Mainnet, Testnet) in the `settings/` directory.

## Usage Guide

### Adding Token Performance
```clarity
(contract-call? 'token-performance 'add-token-performance
  (string-ascii 'BTC)
  u50000 u1000000 u1000000000
  (list u49000 u50000 u51000))
```

### Updating Token Performance
```clarity
(contract-call? 'token-performance 'update-token-performance
  (string-ascii 'ETH)
  u3500 u600000 u600000000
  (list u3400 u3500 u3600))
```

### Retrieving Token Performance
```clarity
(contract-call? 'token-performance 'get-token-performance
  (string-ascii 'BTC))
```

## Testing

The project includes a comprehensive test suite in the `tests/token_performance_test.ts` file. The test suite covers various scenarios, including:

- Successfully adding a new token's performance metrics
- Updating an existing token's performance metrics
- Preventing non-owners from adding or updating token performance
- Validating input metrics (rejecting zero or negative values)
- Verifying the token tracking list growth and limit
- Handling token retrieval (existing and non-existent tokens)

To run the tests, use the Clarinet CLI: `clarinet test`

## Security Considerations

- The contract uses authorization checks to ensure only the contract owner can add or update token performance metrics.
- Input metrics are validated to ensure they meet the required criteria (positive non-zero values).
- The tracked tokens list is limited to 100 entries to prevent potential overflow issues.
- The contract does not expose any sensitive or personal user data, and all performance metrics are stored in a transparent and decentralized manner on the Stacks blockchain.