// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IBadgeNFT
/// @notice Interface for the Shinroe Badge NFT contract
/// @dev Soulbound (non-transferable) reputation badges
interface IBadgeNFT {
    // ============ Enums ============

    /// @notice Types of badges that can be earned
    enum BadgeType {
        VERIFIED_IDENTITY,
        TRUSTED_TRADER,
        COMMUNITY_BUILDER,
        EARLY_ADOPTER,
        ELITE_SCORE
    }

    // ============ Events ============

    /// @notice Emitted when a badge is minted
    /// @param user The address receiving the badge
    /// @param badgeType The type of badge minted
    /// @param tokenId The token ID of the minted badge
    event BadgeMinted(address indexed user, BadgeType indexed badgeType, uint256 tokenId);

    /// @notice Emitted when a badge is revoked
    /// @param user The address whose badge is revoked
    /// @param badgeType The type of badge revoked
    /// @param tokenId The token ID of the revoked badge
    event BadgeRevoked(address indexed user, BadgeType indexed badgeType, uint256 tokenId);

    // ============ Errors ============

    /// @notice Thrown when trying to transfer a soulbound token
    error SoulboundToken();

    /// @notice Thrown when user already has this badge type
    error BadgeAlreadyOwned();

    /// @notice Thrown when caller is not a minter
    error NotMinter();

    /// @notice Thrown when user doesn't have the badge
    error BadgeNotOwned();

    /// @notice Thrown when ScoreRegistry is not set
    error ScoreRegistryNotSet();

    /// @notice Thrown when user is not registered in ScoreRegistry
    error NotRegisteredInScoreRegistry();

    // ============ Functions ============

    /// @notice Mint a badge to a user (only callable by minters)
    /// @param user The address to mint the badge to
    /// @param badgeType The type of badge to mint
    function mintBadge(address user, BadgeType badgeType) external;

    /// @notice Allows registered users to claim their Verified Identity badge
    /// @dev User must be registered in ScoreRegistry first
    function claimVerifiedIdentityBadge() external;

    /// @notice Claim badge with auto-registration in ScoreRegistry
    /// @dev Auto-registers user if not already registered, then mints badge
    /// @param scoreHash The score hash for lazy registration
    function claimVerifiedIdentityBadgeWithAutoRegister(bytes32 scoreHash) external;

    /// @notice Check if a user has a specific badge type
    /// @param user The address to check
    /// @param badgeType The badge type to check for
    /// @return Whether the user has the badge
    function hasBadge(address user, BadgeType badgeType) external view returns (bool);

    /// @notice Get all badge types owned by a user
    /// @param user The address to query
    /// @return Array of badge types
    function getBadges(address user) external view returns (BadgeType[] memory);

    /// @notice Revoke a badge from a user (only callable by admin)
    /// @param user The address to revoke from
    /// @param badgeType The badge type to revoke
    function revokeBadge(address user, BadgeType badgeType) external;

    /// @notice Grant minter role to an address
    /// @param minter The address to grant minter role
    function grantMinter(address minter) external;

    /// @notice Revoke minter role from an address
    /// @param minter The address to revoke minter role
    function revokeMinter(address minter) external;

    /// @notice Check if an address is a minter
    /// @param account The address to check
    /// @return Whether the address is a minter
    function isMinter(address account) external view returns (bool);
}
