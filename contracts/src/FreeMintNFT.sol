// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/token/ERC721/ERC721.sol";
import "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/access/Ownable.sol";
import "@openzeppelin/utils/Strings.sol";

/// @title FreeMintNFT
/// @author EVM Starter Kit
/// @notice ERC721 NFT with free minting for testing purposes
/// @dev Anyone can mint NFTs up to a maximum per wallet
contract FreeMintNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ExceedsMaxPerWallet();
    error MaxSupplyReached();
    error ZeroMintAmount();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string oldURI, string newURI);
    event MaxPerWalletUpdated(uint256 oldMax, uint256 newMax);

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Current token ID counter
    uint256 private _nextTokenId;

    /// @notice Maximum supply of NFTs
    uint256 public maxSupply;

    /// @notice Maximum NFTs per wallet
    uint256 public maxPerWallet;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    /// @notice Number of NFTs minted by each address
    mapping(address => uint256) public mintedByWallet;

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initialize the NFT collection
    /// @param _name Collection name
    /// @param _symbol Collection symbol
    /// @param _maxSupply Maximum total supply
    /// @param _maxPerWallet Maximum NFTs per wallet
    /// @param baseURI Base URI for metadata
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _maxPerWallet,
        string memory baseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        maxPerWallet = _maxPerWallet;
        _baseTokenURI = baseURI;
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Mint an NFT to caller (free, for testing)
    function mint() external {
        _mintInternal(msg.sender);
    }

    /// @notice Mint an NFT to a specific address (free, for testing)
    /// @param to Address to mint NFT to
    function mintTo(address to) external {
        _mintInternal(to);
    }

    /// @notice Mint multiple NFTs to caller
    /// @param amount Number of NFTs to mint
    function mintBatch(uint256 amount) external {
        if (amount == 0) revert ZeroMintAmount();

        for (uint256 i = 0; i < amount; i++) {
            _mintInternal(msg.sender);
        }
    }

    /// @notice Update the base URI (owner only)
    /// @param baseURI New base URI
    function setBaseURI(string memory baseURI) external onlyOwner {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = baseURI;

        emit BaseURIUpdated(oldURI, baseURI);
    }

    /// @notice Update maximum per wallet (owner only)
    /// @param _maxPerWallet New maximum per wallet
    function setMaxPerWallet(uint256 _maxPerWallet) external onlyOwner {
        uint256 oldMax = maxPerWallet;
        maxPerWallet = _maxPerWallet;

        emit MaxPerWalletUpdated(oldMax, _maxPerWallet);
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Internal mint function with checks
    function _mintInternal(address to) internal {
        if (_nextTokenId >= maxSupply) revert MaxSupplyReached();
        if (mintedByWallet[to] >= maxPerWallet) revert ExceedsMaxPerWallet();

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        mintedByWallet[to]++;

        _safeMint(to, tokenId);

        emit NFTMinted(to, tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get the current token ID (next to be minted)
    /// @return Current token ID
    function currentTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Get remaining supply
    /// @return Number of NFTs that can still be minted
    function remainingSupply() external view returns (uint256) {
        return maxSupply - _nextTokenId;
    }

    /// @notice Get number of NFTs minted by a wallet
    /// @param wallet Address to check
    /// @return Number of NFTs minted
    function getMintedByWallet(address wallet) external view returns (uint256) {
        return mintedByWallet[wallet];
    }

    /*//////////////////////////////////////////////////////////////
                          OVERRIDES
    //////////////////////////////////////////////////////////////*/

    /// @dev Base URI for computing tokenURI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @dev Override required by Solidity for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /// @dev Override required by Solidity for ERC721Enumerable
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /// @dev Override required by Solidity for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
