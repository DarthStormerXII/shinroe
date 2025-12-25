// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IScoreRegistry
/// @notice Interface for the Shinroe Score Registry contract
/// @dev Stores score hashes for privacy-preserving reputation scores
interface IScoreRegistry {
    // ============ Events ============

    /// @notice Emitted when a user's score hash is first registered
    /// @param user The address of the user
    /// @param scoreHash The keccak256 hash of (score, salt)
    /// @param timestamp The block timestamp of registration
    event ScoreRegistered(address indexed user, bytes32 scoreHash, uint256 timestamp);

    /// @notice Emitted when a user's score hash is updated
    /// @param user The address of the user
    /// @param oldHash The previous score hash
    /// @param newHash The new score hash
    /// @param timestamp The block timestamp of update
    event ScoreUpdated(address indexed user, bytes32 oldHash, bytes32 newHash, uint256 timestamp);

    /// @notice Emitted when a user changes their score visibility
    /// @param user The address of the user
    /// @param isPublic Whether the score is now public
    event VisibilityChanged(address indexed user, bool isPublic);

    /// @notice Emitted when a user updates their profile URI
    /// @param user The address of the user
    /// @param profileUri The IPFS URI of the profile metadata
    event ProfileUpdated(address indexed user, string profileUri);

    // ============ Errors ============

    /// @notice Thrown when user is already registered
    error AlreadyRegistered();

    /// @notice Thrown when user is not registered
    error NotRegistered();

    /// @notice Thrown when caller is not authorized
    error Unauthorized();

    /// @notice Thrown when score hash is invalid (zero)
    error InvalidScoreHash();

    // ============ Functions ============

    /// @notice Register a user with their initial score hash (authorized only)
    /// @param user The address to register
    /// @param scoreHash The keccak256 hash of (score, salt)
    function registerUser(address user, bytes32 scoreHash) external;

    /// @notice Allows a user to self-register with an initial score hash
    /// @param scoreHash The initial score hash for the user
    function selfRegister(bytes32 scoreHash) external;

    /// @notice Register and set score in one transaction (for lazy registration)
    /// @dev If user is not registered, registers them. Otherwise updates score.
    /// @param scoreHash The score hash to set
    function registerAndUpdateScore(bytes32 scoreHash) external;

    /// @notice Register a user on behalf (for authorized contracts)
    /// @dev Only callable by authorized updaters. Idempotent - does nothing if already registered.
    /// @param user The address to register
    /// @param scoreHash The score hash to set
    function registerUserIfNeeded(address user, bytes32 scoreHash) external;

    /// @notice Update a user's score hash
    /// @param user The address to update
    /// @param newScoreHash The new score hash
    /// @param timestamp The timestamp of the score update
    function updateScore(address user, bytes32 newScoreHash, uint256 timestamp) external;

    /// @notice Get the current score hash for a user
    /// @param user The address to query
    /// @return The current score hash
    function getScoreHash(address user) external view returns (bytes32);

    /// @notice Verify a claimed score against the stored hash
    /// @param user The address to verify
    /// @param score The claimed score value
    /// @param salt The salt used in the original hash
    /// @return Whether the score claim is valid
    function verifyScore(address user, uint256 score, bytes32 salt) external view returns (bool);

    /// @notice Toggle public visibility of caller's score
    /// @param isPublic Whether to make the score public
    function setScorePublic(bool isPublic) external;

    /// @notice Check if a user's score is set to public
    /// @param user The address to query
    /// @return Whether the score is public
    function isScorePublic(address user) external view returns (bool);

    /// @notice Check if a user is registered
    /// @param user The address to query
    /// @return Whether the user is registered
    function isRegistered(address user) external view returns (bool);

    /// @notice Set the profile metadata URI (IPFS) for the caller
    /// @param profileUri The IPFS URI of the profile metadata JSON
    function setProfileUri(string calldata profileUri) external;

    /// @notice Get the profile metadata URI for a user
    /// @param user The address to query
    /// @return The IPFS URI of the profile metadata
    function getProfileUri(address user) external view returns (string memory);
}
