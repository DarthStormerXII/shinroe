// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title ICounter
/// @notice Interface for the Counter contract
interface ICounter {
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
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function increment() external;
    function incrementBy(uint256 amount) external;
    function decrement() external;
    function reset() external;
    function transferOwnership(address newOwner) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function count() external view returns (uint256);
    function owner() external view returns (address);
    function getCount() external view returns (uint256);
    function isOwner(address account) external view returns (bool);
}