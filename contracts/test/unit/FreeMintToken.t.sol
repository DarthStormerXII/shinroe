// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../../src/FreeMintToken.sol";

contract FreeMintTokenTest is Test {
    FreeMintToken public token;

    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    uint256 public constant MAX_MINT_AMOUNT = 1000 ether;

    event TokensMinted(address indexed to, uint256 amount);
    event MaxMintAmountUpdated(uint256 oldAmount, uint256 newAmount);

    function setUp() public {
        token = new FreeMintToken("Free Mint Token", "FMT", MAX_MINT_AMOUNT);
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_deployment() public view {
        assertEq(token.name(), "Free Mint Token");
        assertEq(token.symbol(), "FMT");
        assertEq(token.decimals(), 18);
        assertEq(token.maxMintAmount(), MAX_MINT_AMOUNT);
        assertEq(token.owner(), owner);
        assertEq(token.totalSupply(), 0);
    }

    /*//////////////////////////////////////////////////////////////
                              MINT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_mint() public {
        uint256 amount = 100 ether;

        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TokensMinted(user1, amount);
        token.mint(amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.getMintedBy(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_mintTo() public {
        uint256 amount = 100 ether;

        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TokensMinted(user2, amount);
        token.mintTo(user2, amount);

        assertEq(token.balanceOf(user2), amount);
        assertEq(token.getMintedBy(user2), amount);
    }

    function test_mint_multipleTimes() public {
        uint256 amount = 100 ether;

        vm.startPrank(user1);
        token.mint(amount);
        token.mint(amount);
        token.mint(amount);
        vm.stopPrank();

        assertEq(token.balanceOf(user1), amount * 3);
        assertEq(token.getMintedBy(user1), amount * 3);
    }

    function test_mint_revertsOnZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(FreeMintToken.ZeroMintAmount.selector);
        token.mint(0);
    }

    function test_mint_revertsOnExceedMaxAmount() public {
        vm.prank(user1);
        vm.expectRevert(FreeMintToken.ExceedsMaxMintAmount.selector);
        token.mint(MAX_MINT_AMOUNT + 1);
    }

    function test_mintTo_revertsOnZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert(FreeMintToken.ZeroMintAmount.selector);
        token.mintTo(user2, 0);
    }

    function test_mintTo_revertsOnExceedMaxAmount() public {
        vm.prank(user1);
        vm.expectRevert(FreeMintToken.ExceedsMaxMintAmount.selector);
        token.mintTo(user2, MAX_MINT_AMOUNT + 1);
    }

    /*//////////////////////////////////////////////////////////////
                          OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_setMaxMintAmount() public {
        uint256 newMax = 500 ether;

        vm.expectEmit(false, false, false, true);
        emit MaxMintAmountUpdated(MAX_MINT_AMOUNT, newMax);
        token.setMaxMintAmount(newMax);

        assertEq(token.maxMintAmount(), newMax);
    }

    function test_setMaxMintAmount_revertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        token.setMaxMintAmount(500 ether);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_mint(uint256 amount) public {
        amount = bound(amount, 1, MAX_MINT_AMOUNT);

        vm.prank(user1);
        token.mint(amount);

        assertEq(token.balanceOf(user1), amount);
    }

    function testFuzz_mintTo(address to, uint256 amount) public {
        vm.assume(to != address(0));
        amount = bound(amount, 1, MAX_MINT_AMOUNT);

        token.mintTo(to, amount);

        assertEq(token.balanceOf(to), amount);
    }
}
