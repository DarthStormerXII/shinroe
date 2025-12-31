// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Counter
/// @author Your Name
/// @notice A simple counter contract with access control
/// @dev Implements a counter that can be incremented, decremented, and reset
contract Counter {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error WouldUnderflow();
    error InvalidIncrement();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event CounterIncremented(address indexed user, uint256 newValue);
    event CounterDecremented(address indexed user, uint256 newValue);
    event CounterReset(address indexed user);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public count;
    address public owner;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
        emit OwnerChanged(address(0), msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Increment the counter by 1
    /// @dev Emits CounterIncremented event
    function increment() external {
        unchecked {
            count += 1;
        }
        emit CounterIncremented(msg.sender, count);
    }

    /// @notice Increment the counter by a specific amount
    /// @param amount The amount to increment by
    /// @dev Emits CounterIncremented event
    function incrementBy(uint256 amount) external {
        if (amount == 0) revert InvalidIncrement();
        
        unchecked {
            count += amount;
        }
        emit CounterIncremented(msg.sender, count);
    }

    /// @notice Decrement the counter by 1
    /// @dev Reverts if decrement would cause underflow
    function decrement() external {
        if (count == 0) revert WouldUnderflow();
        
        unchecked {
            count -= 1;
        }
        emit CounterDecremented(msg.sender, count);
    }

    /// @notice Reset the counter to 0
    /// @dev Only callable by owner
    function reset() external onlyOwner {
        count = 0;
        emit CounterReset(msg.sender);
    }

    /// @notice Transfer ownership to a new address
    /// @param newOwner The address of the new owner
    /// @dev Only callable by current owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnerChanged(previousOwner, newOwner);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get the current count value
    /// @return The current count
    function getCount() external view returns (uint256) {
        return count;
    }

    /// @notice Check if an address is the owner
    /// @param account The address to check
    /// @return True if the address is the owner
    function isOwner(address account) external view returns (bool) {
        return account == owner;
    }
}