// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/token/ERC20/ERC20.sol";
import "@openzeppelin/access/Ownable.sol";

/// @title FreeMintToken
/// @author EVM Starter Kit
/// @notice ERC20 token with free minting for testing purposes
/// @dev Anyone can mint tokens up to a maximum per mint
contract FreeMintToken is ERC20, Ownable {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ExceedsMaxMintAmount();
    error ZeroMintAmount();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event TokensMinted(address indexed to, uint256 amount);
    event MaxMintAmountUpdated(uint256 oldAmount, uint256 newAmount);

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Maximum amount that can be minted per transaction
    uint256 public maxMintAmount;

    /// @notice Total amount minted by each address
    mapping(address => uint256) public mintedBy;

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initialize the token with name, symbol and max mint amount
    /// @param _name Token name
    /// @param _symbol Token symbol
    /// @param _maxMintAmount Maximum tokens mintable per transaction
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxMintAmount
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        maxMintAmount = _maxMintAmount;
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Mint tokens to caller (free, for testing)
    /// @param amount Amount of tokens to mint
    function mint(uint256 amount) external {
        if (amount == 0) revert ZeroMintAmount();
        if (amount > maxMintAmount) revert ExceedsMaxMintAmount();

        mintedBy[msg.sender] += amount;
        _mint(msg.sender, amount);

        emit TokensMinted(msg.sender, amount);
    }

    /// @notice Mint tokens to a specific address (free, for testing)
    /// @param to Address to mint tokens to
    /// @param amount Amount of tokens to mint
    function mintTo(address to, uint256 amount) external {
        if (amount == 0) revert ZeroMintAmount();
        if (amount > maxMintAmount) revert ExceedsMaxMintAmount();

        mintedBy[to] += amount;
        _mint(to, amount);

        emit TokensMinted(to, amount);
    }

    /// @notice Update the maximum mint amount (owner only)
    /// @param _maxMintAmount New maximum mint amount
    function setMaxMintAmount(uint256 _maxMintAmount) external onlyOwner {
        uint256 oldAmount = maxMintAmount;
        maxMintAmount = _maxMintAmount;

        emit MaxMintAmountUpdated(oldAmount, _maxMintAmount);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get the total amount minted by an address
    /// @param account Address to check
    /// @return Total amount minted by the address
    function getMintedBy(address account) external view returns (uint256) {
        return mintedBy[account];
    }
}
