// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Constants
/// @notice Common constants used across tests
library Constants {
    /// @notice Time constants
    uint256 internal constant SECONDS_PER_DAY = 86_400;
    uint256 internal constant SECONDS_PER_WEEK = 604_800;
    uint256 internal constant SECONDS_PER_MONTH = 2_592_000; // 30 days
    uint256 internal constant SECONDS_PER_YEAR = 31_536_000; // 365 days

    /// @notice Common percentages in basis points (100% = 10_000)
    uint256 internal constant ONE_HUNDRED_PERCENT = 10_000;
    uint256 internal constant FIFTY_PERCENT = 5_000;
    uint256 internal constant TWENTY_FIVE_PERCENT = 2_500;
    uint256 internal constant TEN_PERCENT = 1_000;
    uint256 internal constant FIVE_PERCENT = 500;
    uint256 internal constant ONE_PERCENT = 100;

    /// @notice Common precision values
    uint256 internal constant PRECISION_1E6 = 1e6;
    uint256 internal constant PRECISION_1E18 = 1e18;
    uint256 internal constant PRECISION_1E27 = 1e27;

    /// @notice Common token decimals
    uint8 internal constant DECIMALS_6 = 6; // USDC, USDT
    uint8 internal constant DECIMALS_8 = 8; // WBTC
    uint8 internal constant DECIMALS_18 = 18; // ETH, DAI, most ERC20s

    /// @notice Chain IDs
    uint256 internal constant MAINNET_CHAIN_ID = 1;
    uint256 internal constant ARBITRUM_CHAIN_ID = 42_161;
    uint256 internal constant OPTIMISM_CHAIN_ID = 10;
    uint256 internal constant POLYGON_CHAIN_ID = 137;
    uint256 internal constant BASE_CHAIN_ID = 8453;
    uint256 internal constant SEPOLIA_CHAIN_ID = 11_155_111;
    uint256 internal constant ANVIL_CHAIN_ID = 31_337;

    /// @notice Common gas limits
    uint256 internal constant CALLBACK_GAS_LIMIT = 100_000;
    uint256 internal constant TRANSFER_GAS_LIMIT = 50_000;

    /// @notice Error messages
    string internal constant ZERO_ADDRESS_ERROR = "Zero address";
    string internal constant INSUFFICIENT_BALANCE_ERROR = "Insufficient balance";
    string internal constant UNAUTHORIZED_ERROR = "Unauthorized";
    string internal constant INVALID_AMOUNT_ERROR = "Invalid amount";
    string internal constant ALREADY_INITIALIZED_ERROR = "Already initialized";
}