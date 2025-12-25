// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {IScoreRegistry} from "./interfaces/IScoreRegistry.sol";

/// @title ScoreRegistry
/// @notice Stores score hashes for privacy-preserving reputation scores
/// @dev Scores are stored as hashes to maintain privacy. Users can prove their score
///      by revealing the score and salt that hash to the stored value.
contract ScoreRegistry is IScoreRegistry, Ownable {
    // ============ Storage ============

    /// @notice Mapping of user address to their score hash
    mapping(address => bytes32) private _scoreHashes;

    /// @notice Mapping of user address to their score visibility setting
    mapping(address => bool) private _isPublic;

    /// @notice Mapping of user address to their registration timestamp
    mapping(address => uint256) private _registrationTimestamp;

    /// @notice Mapping of user address to their last update timestamp
    mapping(address => uint256) private _lastUpdateTimestamp;

    /// @notice Mapping of authorized updaters
    mapping(address => bool) private _authorizedUpdaters;

    /// @notice Mapping of user address to their profile metadata URI (IPFS)
    mapping(address => string) private _profileUris;

    // ============ Constructor ============

    /// @notice Initialize the contract with the deployer as owner
    constructor() Ownable(msg.sender) {}

    // ============ Modifiers ============

    /// @notice Ensures the caller is authorized to update scores
    modifier onlyAuthorized() {
        if (msg.sender != owner() && !_authorizedUpdaters[msg.sender]) {
            revert Unauthorized();
        }
        _;
    }

    // ============ External Functions ============

    /// @inheritdoc IScoreRegistry
    function registerUser(address user, bytes32 scoreHash) external onlyAuthorized {
        if (_registrationTimestamp[user] != 0) revert AlreadyRegistered();
        if (scoreHash == bytes32(0)) revert InvalidScoreHash();

        _scoreHashes[user] = scoreHash;
        _registrationTimestamp[user] = block.timestamp;
        _lastUpdateTimestamp[user] = block.timestamp;

        emit ScoreRegistered(user, scoreHash, block.timestamp);
    }

    /// @notice Allows a user to self-register with an initial score hash
    /// @param scoreHash The initial score hash for the user
    function selfRegister(bytes32 scoreHash) external {
        if (_registrationTimestamp[msg.sender] != 0) revert AlreadyRegistered();
        if (scoreHash == bytes32(0)) revert InvalidScoreHash();

        _scoreHashes[msg.sender] = scoreHash;
        _registrationTimestamp[msg.sender] = block.timestamp;
        _lastUpdateTimestamp[msg.sender] = block.timestamp;

        emit ScoreRegistered(msg.sender, scoreHash, block.timestamp);
    }

    /// @notice Register and set score in one transaction (for lazy registration)
    /// @dev If user is not registered, registers them. Otherwise updates score.
    /// @param scoreHash The score hash to set
    function registerAndUpdateScore(bytes32 scoreHash) external {
        if (scoreHash == bytes32(0)) revert InvalidScoreHash();

        if (_registrationTimestamp[msg.sender] == 0) {
            // Auto-register if not registered
            _scoreHashes[msg.sender] = scoreHash;
            _registrationTimestamp[msg.sender] = block.timestamp;
            _lastUpdateTimestamp[msg.sender] = block.timestamp;
            emit ScoreRegistered(msg.sender, scoreHash, block.timestamp);
        } else {
            // Just update score if already registered
            bytes32 oldHash = _scoreHashes[msg.sender];
            _scoreHashes[msg.sender] = scoreHash;
            _lastUpdateTimestamp[msg.sender] = block.timestamp;
            emit ScoreUpdated(msg.sender, oldHash, scoreHash, block.timestamp);
        }
    }

    /// @notice Register a user on behalf (for authorized contracts like EndorsementVault)
    /// @dev Only callable by authorized updaters. Idempotent - does nothing if already registered.
    /// @param user The address to register
    /// @param scoreHash The score hash to set
    function registerUserIfNeeded(address user, bytes32 scoreHash) external onlyAuthorized {
        if (scoreHash == bytes32(0)) revert InvalidScoreHash();

        // Only register if not already registered (idempotent)
        if (_registrationTimestamp[user] == 0) {
            _scoreHashes[user] = scoreHash;
            _registrationTimestamp[user] = block.timestamp;
            _lastUpdateTimestamp[user] = block.timestamp;
            emit ScoreRegistered(user, scoreHash, block.timestamp);
        }
    }

    /// @inheritdoc IScoreRegistry
    function updateScore(address user, bytes32 newScoreHash, uint256 timestamp) external onlyAuthorized {
        if (_registrationTimestamp[user] == 0) revert NotRegistered();
        if (newScoreHash == bytes32(0)) revert InvalidScoreHash();

        bytes32 oldHash = _scoreHashes[user];
        _scoreHashes[user] = newScoreHash;
        _lastUpdateTimestamp[user] = timestamp;

        emit ScoreUpdated(user, oldHash, newScoreHash, timestamp);
    }

    /// @inheritdoc IScoreRegistry
    function getScoreHash(address user) external view returns (bytes32) {
        return _scoreHashes[user];
    }

    /// @inheritdoc IScoreRegistry
    function verifyScore(address user, uint256 score, bytes32 salt) external view returns (bool) {
        bytes32 storedHash = _scoreHashes[user];
        if (storedHash == bytes32(0)) return false;

        bytes32 computedHash = keccak256(abi.encodePacked(user, score, salt));
        return storedHash == computedHash;
    }

    /// @inheritdoc IScoreRegistry
    function setScorePublic(bool isPublic) external {
        if (_registrationTimestamp[msg.sender] == 0) revert NotRegistered();

        _isPublic[msg.sender] = isPublic;
        emit VisibilityChanged(msg.sender, isPublic);
    }

    /// @inheritdoc IScoreRegistry
    function isScorePublic(address user) external view returns (bool) {
        return _isPublic[user];
    }

    /// @inheritdoc IScoreRegistry
    function isRegistered(address user) external view returns (bool) {
        return _registrationTimestamp[user] != 0;
    }

    // ============ Admin Functions ============

    /// @notice Add an authorized updater
    /// @param updater The address to authorize
    function addAuthorizedUpdater(address updater) external onlyOwner {
        _authorizedUpdaters[updater] = true;
    }

    /// @notice Remove an authorized updater
    /// @param updater The address to remove
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        _authorizedUpdaters[updater] = false;
    }

    /// @notice Check if an address is an authorized updater
    /// @param updater The address to check
    /// @return Whether the address is authorized
    function isAuthorizedUpdater(address updater) external view returns (bool) {
        return _authorizedUpdaters[updater];
    }

    /// @notice Get the registration timestamp for a user
    /// @param user The address to query
    /// @return The registration timestamp
    function getRegistrationTimestamp(address user) external view returns (uint256) {
        return _registrationTimestamp[user];
    }

    /// @notice Get the last update timestamp for a user
    /// @param user The address to query
    /// @return The last update timestamp
    function getLastUpdateTimestamp(address user) external view returns (uint256) {
        return _lastUpdateTimestamp[user];
    }

    // ============ Profile Functions ============

    /// @inheritdoc IScoreRegistry
    function setProfileUri(string calldata profileUri) external {
        _profileUris[msg.sender] = profileUri;
        emit ProfileUpdated(msg.sender, profileUri);
    }

    /// @inheritdoc IScoreRegistry
    function getProfileUri(address user) external view returns (string memory) {
        return _profileUris[user];
    }
}
