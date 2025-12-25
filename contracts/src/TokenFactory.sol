// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";

/// @title LaunchToken - ERC20 created via TokenFactory
contract LaunchToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = decimals_;
        _mint(owner, totalSupply);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}

/// @title TokenFactory - Create ERC20 tokens for airdrops
contract TokenFactory {
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply
    );

    address[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply
    ) external returns (address token) {
        LaunchToken newToken = new LaunchToken(
            name,
            symbol,
            decimals_,
            totalSupply,
            msg.sender
        );
        token = address(newToken);
        allTokens.push(token);
        tokensByCreator[msg.sender].push(token);

        emit TokenCreated(token, msg.sender, name, symbol, totalSupply);
    }

    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }
}
