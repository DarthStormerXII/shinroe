// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IEndorsementVault
/// @notice Interface for the Shinroe Endorsement Vault contract
/// @dev Manages staked endorsements between users with decay mechanics
interface IEndorsementVault {
    // ============ Enums ============

    /// @notice Types of endorsements that can be given
    enum EndorsementType {
        GENERAL,
        FINANCIAL,
        PROFESSIONAL
    }

    // ============ Structs ============

    /// @notice Represents an endorsement between users
    struct Endorsement {
        uint256 id;
        address endorser;
        address endorsee;
        EndorsementType endorsementType;
        uint256 stakeAmount;
        uint256 timestamp;
        bool active;
    }

    // ============ Events ============

    /// @notice Emitted when a new endorsement is created
    /// @param id The endorsement ID
    /// @param endorser The address giving the endorsement
    /// @param endorsee The address receiving the endorsement
    /// @param endorsementType The type of endorsement
    /// @param stakeAmount The amount staked
    /// @param timestamp The creation timestamp
    event EndorsementCreated(
        uint256 indexed id,
        address indexed endorser,
        address indexed endorsee,
        EndorsementType endorsementType,
        uint256 stakeAmount,
        uint256 timestamp
    );

    /// @notice Emitted when an endorsement is withdrawn
    /// @param id The endorsement ID
    /// @param endorser The address withdrawing
    /// @param returnedAmount The amount returned after penalties
    event EndorsementWithdrawn(uint256 indexed id, address indexed endorser, uint256 returnedAmount);

    /// @notice Emitted when an endorsement is slashed
    /// @param id The endorsement ID
    /// @param slashedAmount The amount slashed to protocol
    event EndorsementSlashed(uint256 indexed id, uint256 slashedAmount);

    // ============ Errors ============

    /// @notice Thrown when stake amount is below minimum
    error StakeTooLow();

    /// @notice Thrown when endorsement doesn't exist
    error EndorsementNotFound();

    /// @notice Thrown when caller is not the endorser
    error NotEndorser();

    /// @notice Thrown when endorsement is not active
    error EndorsementNotActive();

    /// @notice Thrown when caller is not admin
    error NotAdmin();

    /// @notice Thrown when user tries to endorse themselves
    error CannotEndorseSelf();

    // ============ Functions ============

    /// @notice Create an endorsement with stake
    /// @param endorsee The address to endorse
    /// @param endorsementType The type of endorsement
    function endorse(address endorsee, EndorsementType endorsementType) external payable;

    /// @notice Give endorsement with auto-registration for the sender
    /// @dev Auto-registers sender in ScoreRegistry if not already registered
    /// @param endorsee The address to endorse
    /// @param endorsementType The type of endorsement
    /// @param senderScoreHash The score hash for lazy registration of sender
    function endorseWithAutoRegister(
        address endorsee,
        EndorsementType endorsementType,
        bytes32 senderScoreHash
    ) external payable;

    /// @notice Withdraw an endorsement (partial stake return based on decay)
    /// @param endorsementId The ID of the endorsement to withdraw
    function withdrawEndorsement(uint256 endorsementId) external;

    /// @notice Slash an endorsement (admin only, sends stake to protocol)
    /// @param endorsementId The ID of the endorsement to slash
    function slashEndorsement(uint256 endorsementId) external;

    /// @notice Get all endorsements for a user
    /// @param user The address to query
    /// @return Array of endorsements
    function getEndorsements(address user) external view returns (Endorsement[] memory);

    /// @notice Get the total endorsement weight for a user (considering decay)
    /// @param user The address to query
    /// @return Total weight in wei
    function getEndorsementWeight(address user) external view returns (uint256);

    /// @notice Get the minimum stake amount
    /// @return Minimum stake in wei
    function minStake() external view returns (uint256);

    /// @notice Calculate decay for an endorsement
    /// @param timestamp The endorsement creation timestamp
    /// @return Decay percentage (0-100, where 100 = no decay)
    function calculateDecay(uint256 timestamp) external view returns (uint256);
}
