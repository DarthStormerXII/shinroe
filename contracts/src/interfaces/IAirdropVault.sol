// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IAirdropVault
/// @notice Interface for the reputation-gated airdrop distribution contract
interface IAirdropVault {
    struct EligibilityCriteria {
        uint256 minScore;
        uint256[] requiredBadges;
        uint256 minEndorsementWeight;
        bool requiresRegistration;
    }

    event AirdropCreated(uint256 indexed id, address indexed creator, address token);
    event AirdropClaimed(uint256 indexed id, address indexed claimer, uint256 amount);
    event AirdropCancelled(uint256 indexed id);

    error InvalidTimeRange();
    error InvalidAmounts();
    error AirdropNotActive();
    error AirdropNotStarted();
    error AirdropEnded();
    error AlreadyClaimed();
    error AirdropExhausted();
    error NotCreator();
    error AlreadyCancelled();

    function createAirdrop(
        address token,
        uint256 amountPerClaim,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        EligibilityCriteria calldata criteria,
        string calldata metadataUri
    ) external returns (uint256 id);

    function claim(uint256 id, uint256 score, bytes32 salt) external;

    function cancelAirdrop(uint256 id) external;

    function isEligible(uint256 id, address user) external view returns (bool);

    function hasClaimed(uint256 id, address user) external view returns (bool);

    function airdropCount() external view returns (uint256);
}
