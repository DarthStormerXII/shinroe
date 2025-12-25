// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/utils/ReentrancyGuard.sol";
import {IEndorsementVault} from "./interfaces/IEndorsementVault.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";

/// @title EndorsementVault
/// @notice Manages staked endorsements between users with decay mechanics
/// @dev Endorsements lose 10% weight per month after 6 months
contract EndorsementVault is IEndorsementVault, Ownable, ReentrancyGuard {
    // ============ Constants ============

    /// @notice Minimum stake amount (0.01 ETH)
    uint256 public constant MIN_STAKE = 0.01 ether;

    /// @notice Period before decay starts (6 months in seconds)
    uint256 public constant DECAY_START_PERIOD = 180 days;

    /// @notice Decay rate per month (10% = 1000 basis points)
    uint256 public constant DECAY_RATE_PER_MONTH = 1000;

    /// @notice Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice One month in seconds
    uint256 public constant ONE_MONTH = 30 days;

    // ============ Storage ============

    /// @notice Next endorsement ID
    uint256 private _nextEndorsementId;

    /// @notice Mapping of endorsement ID to endorsement data
    mapping(uint256 => Endorsement) private _endorsements;

    /// @notice Mapping of endorsee to their endorsement IDs
    mapping(address => uint256[]) private _endorseeToEndorsementIds;

    /// @notice Mapping of endorser to their endorsement IDs
    mapping(address => uint256[]) private _endorserToEndorsementIds;

    /// @notice Protocol treasury address
    address public treasury;

    /// @notice Reference to ScoreRegistry for auto-registration
    IScoreRegistry public scoreRegistry;

    // ============ Constructor ============

    /// @notice Initialize the contract
    /// @param _treasury The address to receive slashed stakes
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
    }

    // ============ External Functions ============

    /// @inheritdoc IEndorsementVault
    function endorse(address endorsee, EndorsementType endorsementType) external payable nonReentrant {
        if (msg.value < MIN_STAKE) revert StakeTooLow();
        if (endorsee == msg.sender) revert CannotEndorseSelf();

        uint256 endorsementId = _nextEndorsementId++;

        Endorsement memory newEndorsement = Endorsement({
            id: endorsementId,
            endorser: msg.sender,
            endorsee: endorsee,
            endorsementType: endorsementType,
            stakeAmount: msg.value,
            timestamp: block.timestamp,
            active: true
        });

        _endorsements[endorsementId] = newEndorsement;
        _endorseeToEndorsementIds[endorsee].push(endorsementId);
        _endorserToEndorsementIds[msg.sender].push(endorsementId);

        emit EndorsementCreated(endorsementId, msg.sender, endorsee, endorsementType, msg.value, block.timestamp);
    }

    /// @notice Give endorsement with auto-registration for the sender
    /// @dev Auto-registers sender in ScoreRegistry if not already registered
    /// @param endorsee The address to endorse
    /// @param endorsementType The type of endorsement
    /// @param senderScoreHash The score hash for lazy registration of sender
    function endorseWithAutoRegister(
        address endorsee,
        EndorsementType endorsementType,
        bytes32 senderScoreHash
    ) external payable nonReentrant {
        if (msg.value < MIN_STAKE) revert StakeTooLow();
        if (endorsee == msg.sender) revert CannotEndorseSelf();

        // Auto-register sender if needed
        if (address(scoreRegistry) != address(0) && !scoreRegistry.isRegistered(msg.sender)) {
            scoreRegistry.registerUserIfNeeded(msg.sender, senderScoreHash);
        }

        uint256 endorsementId = _nextEndorsementId++;

        Endorsement memory newEndorsement = Endorsement({
            id: endorsementId,
            endorser: msg.sender,
            endorsee: endorsee,
            endorsementType: endorsementType,
            stakeAmount: msg.value,
            timestamp: block.timestamp,
            active: true
        });

        _endorsements[endorsementId] = newEndorsement;
        _endorseeToEndorsementIds[endorsee].push(endorsementId);
        _endorserToEndorsementIds[msg.sender].push(endorsementId);

        emit EndorsementCreated(endorsementId, msg.sender, endorsee, endorsementType, msg.value, block.timestamp);
    }

    /// @inheritdoc IEndorsementVault
    function withdrawEndorsement(uint256 endorsementId) external nonReentrant {
        Endorsement storage endorsement = _endorsements[endorsementId];

        if (endorsement.endorser == address(0)) revert EndorsementNotFound();
        if (endorsement.endorser != msg.sender) revert NotEndorser();
        if (!endorsement.active) revert EndorsementNotActive();

        endorsement.active = false;

        uint256 decayPercent = calculateDecay(endorsement.timestamp);
        uint256 returnAmount = (endorsement.stakeAmount * decayPercent) / 100;
        uint256 penaltyAmount = endorsement.stakeAmount - returnAmount;

        if (returnAmount > 0) {
            (bool success,) = msg.sender.call{value: returnAmount}("");
            require(success, "Transfer failed");
        }

        if (penaltyAmount > 0 && treasury != address(0)) {
            (bool success,) = treasury.call{value: penaltyAmount}("");
            require(success, "Treasury transfer failed");
        }

        emit EndorsementWithdrawn(endorsementId, msg.sender, returnAmount);
    }

    /// @inheritdoc IEndorsementVault
    function slashEndorsement(uint256 endorsementId) external onlyOwner nonReentrant {
        Endorsement storage endorsement = _endorsements[endorsementId];

        if (endorsement.endorser == address(0)) revert EndorsementNotFound();
        if (!endorsement.active) revert EndorsementNotActive();

        endorsement.active = false;
        uint256 slashedAmount = endorsement.stakeAmount;

        if (treasury != address(0)) {
            (bool success,) = treasury.call{value: slashedAmount}("");
            require(success, "Treasury transfer failed");
        }

        emit EndorsementSlashed(endorsementId, slashedAmount);
    }

    /// @inheritdoc IEndorsementVault
    function getEndorsements(address user) external view returns (Endorsement[] memory) {
        uint256[] storage ids = _endorseeToEndorsementIds[user];
        Endorsement[] memory result = new Endorsement[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _endorsements[ids[i]];
        }

        return result;
    }

    /// @inheritdoc IEndorsementVault
    function getEndorsementWeight(address user) external view returns (uint256) {
        uint256[] storage ids = _endorseeToEndorsementIds[user];
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            Endorsement storage endorsement = _endorsements[ids[i]];
            if (endorsement.active) {
                uint256 decayPercent = calculateDecay(endorsement.timestamp);
                totalWeight += (endorsement.stakeAmount * decayPercent) / 100;
            }
        }

        return totalWeight;
    }

    /// @inheritdoc IEndorsementVault
    function minStake() external pure returns (uint256) {
        return MIN_STAKE;
    }

    /// @inheritdoc IEndorsementVault
    function calculateDecay(uint256 timestamp) public view returns (uint256) {
        uint256 elapsed = block.timestamp - timestamp;

        // No decay for first 6 months
        if (elapsed < DECAY_START_PERIOD) {
            return 100;
        }

        // Calculate months elapsed after grace period
        uint256 monthsAfterGrace = (elapsed - DECAY_START_PERIOD) / ONE_MONTH;

        // 10% decay per month, max 100% decay (0% remaining)
        uint256 decayBasisPoints = monthsAfterGrace * DECAY_RATE_PER_MONTH;

        if (decayBasisPoints >= BASIS_POINTS) {
            return 0;
        }

        return 100 - (decayBasisPoints / 100);
    }

    // ============ Admin Functions ============

    /// @notice Update the treasury address
    /// @param newTreasury The new treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }

    /// @notice Set the ScoreRegistry address for auto-registration
    /// @param _scoreRegistry The ScoreRegistry contract address
    function setScoreRegistry(address _scoreRegistry) external onlyOwner {
        scoreRegistry = IScoreRegistry(_scoreRegistry);
    }

    /// @notice Get endorsement by ID
    /// @param endorsementId The endorsement ID
    /// @return The endorsement data
    function getEndorsement(uint256 endorsementId) external view returns (Endorsement memory) {
        return _endorsements[endorsementId];
    }

    /// @notice Get all endorsements made by an endorser
    /// @param endorser The endorser address
    /// @return Array of endorsements
    function getEndorsementsByEndorser(address endorser) external view returns (Endorsement[] memory) {
        uint256[] storage ids = _endorserToEndorsementIds[endorser];
        Endorsement[] memory result = new Endorsement[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _endorsements[ids[i]];
        }

        return result;
    }
}
