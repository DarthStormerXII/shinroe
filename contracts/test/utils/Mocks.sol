// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "solmate/tokens/ERC20.sol";
import {ERC721} from "solmate/tokens/ERC721.sol";
import {ERC1155} from "solmate/tokens/ERC1155.sol";

/// @title MockERC20
/// @notice Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20(name, symbol, decimals) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/// @title MockERC721
/// @notice Mock ERC721 token for testing
contract MockERC721 is ERC721 {
    uint256 private _currentTokenId;
    string private _baseTokenURI;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = ++_currentTokenId;
        _mint(to, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function setBaseURI(string memory baseURI) external {
        _baseTokenURI = baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, toString(tokenId)));
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

/// @title MockERC1155
/// @notice Mock ERC1155 token for testing
contract MockERC1155 is ERC1155 {
    string private _uri;

    constructor(string memory uri_) {
        _uri = uri_;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external {
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external {
        _batchMint(to, ids, amounts, data);
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        _burn(from, id, amount);
    }

    function setURI(string memory newURI) external {
        _uri = newURI;
    }

    function uri(uint256) public view override returns (string memory) {
        return _uri;
    }
}

/// @title MockFailingContract
/// @notice Mock contract that always reverts
contract MockFailingContract {
    error AlwaysFails();

    fallback() external payable {
        revert AlwaysFails();
    }

    receive() external payable {
        revert AlwaysFails();
    }

    function fail() external pure {
        revert AlwaysFails();
    }

    function failWithMessage() external pure {
        revert("This function always fails");
    }

    function failWithCustomError(string memory reason) external pure {
        revert(reason);
    }
}

/// @title MockUpgradeable
/// @notice Mock upgradeable contract for testing proxy patterns
contract MockUpgradeable {
    uint256 public version;
    uint256 public value;
    address public owner;
    bool public initialized;

    error AlreadyInitialized();
    error Unauthorized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function initialize(address _owner) external {
        if (initialized) revert AlreadyInitialized();
        initialized = true;
        owner = _owner;
        version = 1;
    }

    function setValue(uint256 _value) external onlyOwner {
        value = _value;
    }

    function upgradeToV2() external onlyOwner {
        version = 2;
    }
}

/// @title MockOracle
/// @notice Mock oracle for testing price feeds
contract MockOracle {
    mapping(address => uint256) private prices;
    mapping(address => uint8) private decimals_;
    uint256 private timestamp_;

    function setPrice(address token, uint256 price, uint8 decimal) external {
        prices[token] = price;
        decimals_[token] = decimal;
        timestamp_ = block.timestamp;
    }

    function getPrice(address token) external view returns (uint256, uint8, uint256) {
        return (prices[token], decimals_[token], timestamp_);
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            1,
            int256(prices[address(0)]), // Default to ETH price
            timestamp_,
            timestamp_,
            1
        );
    }
}