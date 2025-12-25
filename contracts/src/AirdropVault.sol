// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/token/ERC20/utils/SafeERC20.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";
import {IBadgeNFT} from "./interfaces/IBadgeNFT.sol";

/// @title AirdropVault - Reputation-gated token distribution
contract AirdropVault {
    using SafeERC20 for IERC20;

    struct EligibilityCriteria {
        uint256 minScore;
        uint256[] requiredBadges;
        uint256 minEndorsementWeight;
        bool requiresRegistration;
    }

    struct Airdrop {
        address creator;
        address token;
        uint256 amountPerClaim;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        EligibilityCriteria criteria;
        bool active;
        string metadataUri;
    }

    IScoreRegistry public immutable scoreRegistry;
    IBadgeNFT public immutable badgeNFT;

    uint256 public airdropCount;
    mapping(uint256 => Airdrop) public airdrops;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

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

    constructor(address _scoreRegistry, address _badgeNFT) {
        scoreRegistry = IScoreRegistry(_scoreRegistry);
        badgeNFT = IBadgeNFT(_badgeNFT);
    }

    function createAirdrop(
        address token,
        uint256 amountPerClaim,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        EligibilityCriteria calldata criteria,
        string calldata metadataUri
    ) external returns (uint256 id) {
        if (endTime <= startTime) revert InvalidTimeRange();
        if (totalAmount < amountPerClaim) revert InvalidAmounts();

        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        id = airdropCount++;
        Airdrop storage airdrop = airdrops[id];
        airdrop.creator = msg.sender;
        airdrop.token = token;
        airdrop.amountPerClaim = amountPerClaim;
        airdrop.totalAmount = totalAmount;
        airdrop.claimedAmount = 0;
        airdrop.startTime = startTime;
        airdrop.endTime = endTime;
        airdrop.criteria = criteria;
        airdrop.active = true;
        airdrop.metadataUri = metadataUri;

        emit AirdropCreated(id, msg.sender, token);
    }

    function claim(uint256 id, uint256 score, bytes32 salt) external {
        Airdrop storage airdrop = airdrops[id];
        if (!airdrop.active) revert AirdropNotActive();
        if (block.timestamp < airdrop.startTime) revert AirdropNotStarted();
        if (block.timestamp > airdrop.endTime) revert AirdropEnded();
        if (hasClaimed[id][msg.sender]) revert AlreadyClaimed();
        if (airdrop.claimedAmount + airdrop.amountPerClaim > airdrop.totalAmount) {
            revert AirdropExhausted();
        }

        _checkEligibility(airdrop.criteria, msg.sender, score, salt);

        hasClaimed[id][msg.sender] = true;
        airdrop.claimedAmount += airdrop.amountPerClaim;

        IERC20(airdrop.token).safeTransfer(msg.sender, airdrop.amountPerClaim);

        emit AirdropClaimed(id, msg.sender, airdrop.amountPerClaim);
    }

    function _checkEligibility(
        EligibilityCriteria storage criteria,
        address user,
        uint256 score,
        bytes32 salt
    ) internal view {
        if (criteria.requiresRegistration) {
            require(scoreRegistry.isRegistered(user), "Not registered");
        }

        if (criteria.minScore > 0) {
            require(scoreRegistry.verifyScore(user, score, salt), "Invalid score proof");
            require(score >= criteria.minScore, "Score too low");
        }

        for (uint256 i = 0; i < criteria.requiredBadges.length; i++) {
            IBadgeNFT.BadgeType badgeType = IBadgeNFT.BadgeType(criteria.requiredBadges[i]);
            require(badgeNFT.hasBadge(user, badgeType), "Missing required badge");
        }
    }

    function cancelAirdrop(uint256 id) external {
        Airdrop storage airdrop = airdrops[id];
        if (msg.sender != airdrop.creator) revert NotCreator();
        if (!airdrop.active) revert AlreadyCancelled();

        airdrop.active = false;
        uint256 remaining = airdrop.totalAmount - airdrop.claimedAmount;
        if (remaining > 0) {
            IERC20(airdrop.token).safeTransfer(msg.sender, remaining);
        }

        emit AirdropCancelled(id);
    }

    function isEligible(uint256 id, address user) external view returns (bool) {
        Airdrop storage airdrop = airdrops[id];
        if (!airdrop.active) return false;
        if (hasClaimed[id][user]) return false;

        EligibilityCriteria storage c = airdrop.criteria;

        if (c.requiresRegistration && !scoreRegistry.isRegistered(user)) {
            return false;
        }

        for (uint256 i = 0; i < c.requiredBadges.length; i++) {
            IBadgeNFT.BadgeType badgeType = IBadgeNFT.BadgeType(c.requiredBadges[i]);
            if (!badgeNFT.hasBadge(user, badgeType)) {
                return false;
            }
        }

        return true;
    }

    function getAirdrop(uint256 id) external view returns (
        address creator,
        address token,
        uint256 amountPerClaim,
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 startTime,
        uint256 endTime,
        bool active,
        string memory metadataUri
    ) {
        Airdrop storage a = airdrops[id];
        return (
            a.creator,
            a.token,
            a.amountPerClaim,
            a.totalAmount,
            a.claimedAmount,
            a.startTime,
            a.endTime,
            a.active,
            a.metadataUri
        );
    }

    function getAirdropCriteria(uint256 id) external view returns (
        uint256 minScore,
        uint256[] memory requiredBadges,
        uint256 minEndorsementWeight,
        bool requiresRegistration
    ) {
        EligibilityCriteria storage c = airdrops[id].criteria;
        return (c.minScore, c.requiredBadges, c.minEndorsementWeight, c.requiresRegistration);
    }
}
