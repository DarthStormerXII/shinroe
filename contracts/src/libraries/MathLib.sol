// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title MathLib
/// @notice A library for mathematical operations with overflow protection
/// @dev Uses custom errors for gas efficiency
library MathLib {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error Overflow();
    error Underflow();
    error DivisionByZero();

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Safely add two numbers
    /// @param a First number
    /// @param b Second number
    /// @return result The sum of a and b
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256 result) {
        unchecked {
            result = a + b;
            if (result < a) revert Overflow();
        }
    }

    /// @notice Safely subtract two numbers
    /// @param a First number
    /// @param b Second number
    /// @return result The difference of a and b
    function safeSub(uint256 a, uint256 b) internal pure returns (uint256 result) {
        if (b > a) revert Underflow();
        unchecked {
            result = a - b;
        }
    }

    /// @notice Safely multiply two numbers
    /// @param a First number
    /// @param b Second number
    /// @return result The product of a and b
    function safeMul(uint256 a, uint256 b) internal pure returns (uint256 result) {
        if (a == 0) return 0;
        unchecked {
            result = a * b;
            if (result / a != b) revert Overflow();
        }
    }

    /// @notice Safely divide two numbers
    /// @param a Numerator
    /// @param b Denominator
    /// @return result The quotient of a and b
    function safeDiv(uint256 a, uint256 b) internal pure returns (uint256 result) {
        if (b == 0) revert DivisionByZero();
        unchecked {
            result = a / b;
        }
    }

    /// @notice Calculate percentage with basis points (10000 = 100%)
    /// @param amount The amount to calculate percentage of
    /// @param basisPoints The percentage in basis points
    /// @return result The calculated percentage
    function percentageOf(uint256 amount, uint256 basisPoints) internal pure returns (uint256 result) {
        result = safeMul(amount, basisPoints) / 10_000;
    }

    /// @notice Get the minimum of two numbers
    /// @param a First number
    /// @param b Second number
    /// @return The smaller of the two numbers
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /// @notice Get the maximum of two numbers
    /// @param a First number
    /// @param b Second number
    /// @return The larger of the two numbers
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /// @notice Calculate average of two numbers (rounded down)
    /// @param a First number
    /// @param b Second number
    /// @return The average of a and b
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        unchecked {
            return (a & b) + ((a ^ b) >> 1);
        }
    }

    /// @notice Check if a number is even
    /// @param n The number to check
    /// @return True if the number is even
    function isEven(uint256 n) internal pure returns (bool) {
        return n & 1 == 0;
    }

    /// @notice Calculate square root using Babylonian method
    /// @param x The number to calculate square root of
    /// @return result The square root of x
    function sqrt(uint256 x) internal pure returns (uint256 result) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        result = x;
        
        while (z < result) {
            result = z;
            z = (x / z + z) / 2;
        }
    }
}