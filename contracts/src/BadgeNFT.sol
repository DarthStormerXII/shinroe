// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {IBadgeNFT} from "./interfaces/IBadgeNFT.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";

/// @title BadgeNFT
/// @notice Soulbound (non-transferable) reputation badges
/// @dev Each user can only have one of each badge type
contract BadgeNFT is IBadgeNFT, ERC721Enumerable, Ownable {
    // ============ Storage ============

    /// @notice Next token ID
    uint256 private _nextTokenId;

    /// @notice Mapping of minter addresses
    mapping(address => bool) private _minters;

    /// @notice Mapping of user => badge type => has badge
    mapping(address => mapping(BadgeType => bool)) private _userBadges;

    /// @notice Mapping of user => badge type => token ID
    mapping(address => mapping(BadgeType => uint256)) private _userBadgeTokenIds;

    /// @notice Mapping of token ID => badge type
    mapping(uint256 => BadgeType) private _tokenBadgeType;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Reference to ScoreRegistry for registration verification
    IScoreRegistry public scoreRegistry;

    // ============ Constructor ============

    /// @notice Initialize the contract
    /// @param name_ The NFT collection name
    /// @param symbol_ The NFT collection symbol
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {
        _minters[msg.sender] = true;
    }

    // ============ Modifiers ============

    /// @notice Ensures the caller is a minter
    modifier onlyMinter() {
        if (!_minters[msg.sender]) revert NotMinter();
        _;
    }

    // ============ External Functions ============

    /// @inheritdoc IBadgeNFT
    function mintBadge(address user, BadgeType badgeType) external onlyMinter {
        if (_userBadges[user][badgeType]) revert BadgeAlreadyOwned();

        uint256 tokenId = _nextTokenId++;
        _safeMint(user, tokenId);

        _userBadges[user][badgeType] = true;
        _userBadgeTokenIds[user][badgeType] = tokenId;
        _tokenBadgeType[tokenId] = badgeType;

        emit BadgeMinted(user, badgeType, tokenId);
    }

    /// @notice Allows registered users to claim their Verified Identity badge
    /// @dev User must be registered in ScoreRegistry first
    function claimVerifiedIdentityBadge() external {
        if (address(scoreRegistry) == address(0)) revert ScoreRegistryNotSet();
        if (!scoreRegistry.isRegistered(msg.sender)) revert NotRegisteredInScoreRegistry();
        if (_userBadges[msg.sender][BadgeType.VERIFIED_IDENTITY]) revert BadgeAlreadyOwned();

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        _userBadges[msg.sender][BadgeType.VERIFIED_IDENTITY] = true;
        _userBadgeTokenIds[msg.sender][BadgeType.VERIFIED_IDENTITY] = tokenId;
        _tokenBadgeType[tokenId] = BadgeType.VERIFIED_IDENTITY;

        emit BadgeMinted(msg.sender, BadgeType.VERIFIED_IDENTITY, tokenId);
    }

    /// @notice Claim badge with auto-registration in ScoreRegistry
    /// @dev Auto-registers user if not already registered, then mints badge
    /// @param scoreHash The score hash for lazy registration
    function claimVerifiedIdentityBadgeWithAutoRegister(bytes32 scoreHash) external {
        if (address(scoreRegistry) == address(0)) revert ScoreRegistryNotSet();
        if (_userBadges[msg.sender][BadgeType.VERIFIED_IDENTITY]) revert BadgeAlreadyOwned();

        // Auto-register if needed
        if (!scoreRegistry.isRegistered(msg.sender)) {
            scoreRegistry.registerUserIfNeeded(msg.sender, scoreHash);
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        _userBadges[msg.sender][BadgeType.VERIFIED_IDENTITY] = true;
        _userBadgeTokenIds[msg.sender][BadgeType.VERIFIED_IDENTITY] = tokenId;
        _tokenBadgeType[tokenId] = BadgeType.VERIFIED_IDENTITY;

        emit BadgeMinted(msg.sender, BadgeType.VERIFIED_IDENTITY, tokenId);
    }

    /// @inheritdoc IBadgeNFT
    function hasBadge(address user, BadgeType badgeType) external view returns (bool) {
        return _userBadges[user][badgeType];
    }

    /// @inheritdoc IBadgeNFT
    function getBadges(address user) external view returns (BadgeType[] memory) {
        uint256 count = 0;

        // Count badges
        for (uint256 i = 0; i < 5; i++) {
            if (_userBadges[user][BadgeType(i)]) count++;
        }

        // Collect badges
        BadgeType[] memory badges = new BadgeType[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < 5; i++) {
            if (_userBadges[user][BadgeType(i)]) {
                badges[index++] = BadgeType(i);
            }
        }

        return badges;
    }

    /// @inheritdoc IBadgeNFT
    function revokeBadge(address user, BadgeType badgeType) external onlyOwner {
        if (!_userBadges[user][badgeType]) revert BadgeNotOwned();

        uint256 tokenId = _userBadgeTokenIds[user][badgeType];
        _burn(tokenId);

        _userBadges[user][badgeType] = false;
        delete _userBadgeTokenIds[user][badgeType];
        delete _tokenBadgeType[tokenId];

        emit BadgeRevoked(user, badgeType, tokenId);
    }

    /// @inheritdoc IBadgeNFT
    function grantMinter(address minter) external onlyOwner {
        _minters[minter] = true;
    }

    /// @inheritdoc IBadgeNFT
    function revokeMinter(address minter) external onlyOwner {
        _minters[minter] = false;
    }

    /// @inheritdoc IBadgeNFT
    function isMinter(address account) external view returns (bool) {
        return _minters[account];
    }

    /// @notice Set the ScoreRegistry address for registration verification
    /// @param _scoreRegistry The ScoreRegistry contract address
    function setScoreRegistry(address _scoreRegistry) external onlyOwner {
        scoreRegistry = IScoreRegistry(_scoreRegistry);
    }

    // ============ Soulbound Override ============

    /// @notice Override to prevent transfers (soulbound)
    /// @dev This prevents all transfers except minting and burning
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == 0) and burning (to == 0)
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }

    // ============ View Functions ============

    /// @notice Get the badge type for a token
    /// @param tokenId The token ID
    /// @return The badge type
    function getBadgeType(uint256 tokenId) external view returns (BadgeType) {
        return _tokenBadgeType[tokenId];
    }

    /// @notice Get the token ID for a user's badge
    /// @param user The user address
    /// @param badgeType The badge type
    /// @return The token ID (0 if not owned)
    function getTokenId(address user, BadgeType badgeType) external view returns (uint256) {
        return _userBadgeTokenIds[user][badgeType];
    }

    /// @notice Set the base URI for token metadata
    /// @param baseURI The new base URI
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /// @notice Get the base URI
    /// @return The base URI
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}
