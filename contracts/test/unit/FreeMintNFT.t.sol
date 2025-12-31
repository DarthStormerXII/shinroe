// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../../src/FreeMintNFT.sol";

contract FreeMintNFTTest is Test {
    FreeMintNFT public nft;

    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 10;
    string public constant BASE_URI = "https://api.example.com/nft/";

    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string oldURI, string newURI);
    event MaxPerWalletUpdated(uint256 oldMax, uint256 newMax);

    function setUp() public {
        nft = new FreeMintNFT("Free Mint NFT", "FMNFT", MAX_SUPPLY, MAX_PER_WALLET, BASE_URI);
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_deployment() public view {
        assertEq(nft.name(), "Free Mint NFT");
        assertEq(nft.symbol(), "FMNFT");
        assertEq(nft.maxSupply(), MAX_SUPPLY);
        assertEq(nft.maxPerWallet(), MAX_PER_WALLET);
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
        assertEq(nft.currentTokenId(), 0);
        assertEq(nft.remainingSupply(), MAX_SUPPLY);
    }

    /*//////////////////////////////////////////////////////////////
                              MINT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_mint() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, false);
        emit NFTMinted(user1, 0);
        nft.mint();

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.getMintedByWallet(user1), 1);
        assertEq(nft.currentTokenId(), 1);
        assertEq(nft.totalSupply(), 1);
    }

    function test_mintTo() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, false);
        emit NFTMinted(user2, 0);
        nft.mintTo(user2);

        assertEq(nft.balanceOf(user2), 1);
        assertEq(nft.ownerOf(0), user2);
        assertEq(nft.getMintedByWallet(user2), 1);
    }

    function test_mintBatch() public {
        uint256 batchSize = 5;

        vm.prank(user1);
        nft.mintBatch(batchSize);

        assertEq(nft.balanceOf(user1), batchSize);
        assertEq(nft.getMintedByWallet(user1), batchSize);

        // Check all tokens are owned by user1
        for (uint256 i = 0; i < batchSize; i++) {
            assertEq(nft.ownerOf(i), user1);
        }
    }

    function test_mint_multipleTimes() public {
        vm.startPrank(user1);
        nft.mint();
        nft.mint();
        nft.mint();
        vm.stopPrank();

        assertEq(nft.balanceOf(user1), 3);
        assertEq(nft.getMintedByWallet(user1), 3);
    }

    function test_mint_revertsOnMaxPerWallet() public {
        vm.startPrank(user1);

        // Mint up to max
        for (uint256 i = 0; i < MAX_PER_WALLET; i++) {
            nft.mint();
        }

        // Should revert on next mint
        vm.expectRevert(FreeMintNFT.ExceedsMaxPerWallet.selector);
        nft.mint();

        vm.stopPrank();
    }

    function test_mintBatch_revertsOnZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(FreeMintNFT.ZeroMintAmount.selector);
        nft.mintBatch(0);
    }

    function test_mint_revertsOnMaxSupply() public {
        // Deploy with small max supply for testing
        FreeMintNFT smallNft = new FreeMintNFT("Small", "SM", 3, 100, "");

        // Use EOA to mint (avoid ERC721Receiver check)
        vm.startPrank(user1);
        smallNft.mint();
        smallNft.mint();
        smallNft.mint();

        vm.expectRevert(FreeMintNFT.MaxSupplyReached.selector);
        smallNft.mint();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                          OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_setBaseURI() public {
        string memory newURI = "https://newapi.example.com/";

        vm.expectEmit(false, false, false, true);
        emit BaseURIUpdated(BASE_URI, newURI);
        nft.setBaseURI(newURI);

        // Mint to EOA and check tokenURI
        nft.mintTo(user1);
        assertEq(nft.tokenURI(0), string.concat(newURI, "0"));
    }

    function test_setMaxPerWallet() public {
        uint256 newMax = 20;

        vm.expectEmit(false, false, false, true);
        emit MaxPerWalletUpdated(MAX_PER_WALLET, newMax);
        nft.setMaxPerWallet(newMax);

        assertEq(nft.maxPerWallet(), newMax);
    }

    function test_setBaseURI_revertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        nft.setBaseURI("https://hacker.com/");
    }

    function test_setMaxPerWallet_revertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        nft.setMaxPerWallet(100);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_tokenURI() public {
        // Use mintTo for EOA addresses
        nft.mintTo(user1);
        assertEq(nft.tokenURI(0), string.concat(BASE_URI, "0"));

        nft.mintTo(user2);
        assertEq(nft.tokenURI(1), string.concat(BASE_URI, "1"));
    }

    function test_remainingSupply() public {
        assertEq(nft.remainingSupply(), MAX_SUPPLY);

        nft.mintTo(user1);
        assertEq(nft.remainingSupply(), MAX_SUPPLY - 1);

        vm.prank(user2);
        nft.mintBatch(5);
        assertEq(nft.remainingSupply(), MAX_SUPPLY - 6);
    }

    /*//////////////////////////////////////////////////////////////
                          ENUMERABLE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_tokenOfOwnerByIndex() public {
        vm.startPrank(user1);
        nft.mint(); // tokenId 0
        nft.mint(); // tokenId 1
        nft.mint(); // tokenId 2
        vm.stopPrank();

        assertEq(nft.tokenOfOwnerByIndex(user1, 0), 0);
        assertEq(nft.tokenOfOwnerByIndex(user1, 1), 1);
        assertEq(nft.tokenOfOwnerByIndex(user1, 2), 2);
    }

    function test_tokenByIndex() public {
        // Use mintTo for EOA addresses to avoid ERC721Receiver check
        nft.mintTo(user1);
        nft.mintTo(user2);
        nft.mintTo(user3);

        assertEq(nft.tokenByIndex(0), 0);
        assertEq(nft.tokenByIndex(1), 1);
        assertEq(nft.tokenByIndex(2), 2);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_mintBatch(uint256 amount) public {
        amount = bound(amount, 1, MAX_PER_WALLET);

        vm.prank(user1);
        nft.mintBatch(amount);

        assertEq(nft.balanceOf(user1), amount);
    }

    function testFuzz_mintTo(address to) public {
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0); // EOA only for safeMint

        nft.mintTo(to);

        assertEq(nft.balanceOf(to), 1);
        assertEq(nft.ownerOf(0), to);
    }
}
