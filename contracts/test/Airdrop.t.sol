// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {TokenFactory, LaunchToken} from "../src/TokenFactory.sol";
import {AirdropVault} from "../src/AirdropVault.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {IBadgeNFT} from "../src/interfaces/IBadgeNFT.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {BaseTest} from "./utils/BaseTest.sol";

contract AirdropTest is BaseTest {
    TokenFactory public tokenFactory;
    AirdropVault public airdropVault;
    ScoreRegistry public scoreRegistry;
    BadgeNFT public badgeNFT;

    address public token;
    uint256 public constant TOTAL_SUPPLY = 1_000_000 ether;
    uint256 public constant AIRDROP_AMOUNT = 100_000 ether;
    uint256 public constant CLAIM_AMOUNT = 1000 ether;

    uint256 public score = 750;
    bytes32 public salt = keccak256("test_salt");
    bytes32 public scoreHash;

    function setUp() public override {
        super.setUp();

        vm.startPrank(DEPLOYER);

        scoreRegistry = new ScoreRegistry();
        badgeNFT = new BadgeNFT("Shinroe Badge", "SBADGE");
        badgeNFT.setScoreRegistry(address(scoreRegistry));
        scoreRegistry.addAuthorizedUpdater(address(badgeNFT));

        tokenFactory = new TokenFactory();
        airdropVault = new AirdropVault(address(scoreRegistry), address(badgeNFT));

        vm.stopPrank();

        scoreHash = keccak256(abi.encodePacked(ALICE, score, salt));
    }

    function test_CreateToken() public {
        vm.prank(ALICE);
        address newToken = tokenFactory.createToken("Test Token", "TEST", 18, TOTAL_SUPPLY);

        assertEq(tokenFactory.getTokenCount(), 1);
        assertEq(tokenFactory.allTokens(0), newToken);

        address[] memory aliceTokens = tokenFactory.getTokensByCreator(ALICE);
        assertEq(aliceTokens.length, 1);
        assertEq(aliceTokens[0], newToken);

        LaunchToken lt = LaunchToken(newToken);
        assertEq(lt.name(), "Test Token");
        assertEq(lt.symbol(), "TEST");
        assertEq(lt.decimals(), 18);
        assertEq(lt.totalSupply(), TOTAL_SUPPLY);
        assertEq(lt.balanceOf(ALICE), TOTAL_SUPPLY);
    }

    function test_CreateAirdropBasic() public {
        _createToken();
        _registerUser(ALICE);

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), AIRDROP_AMOUNT);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: 0,
            requiredBadges: new uint256[](0),
            minEndorsementWeight: 0,
            requiresRegistration: false
        });

        uint256 id = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            AIRDROP_AMOUNT,
            block.timestamp,
            block.timestamp + 7 days,
            criteria,
            "ipfs://test"
        );
        vm.stopPrank();

        assertEq(id, 0);
        assertEq(airdropVault.airdropCount(), 1);
        assertEq(IERC20(token).balanceOf(address(airdropVault)), AIRDROP_AMOUNT);
    }

    function test_ClaimAirdropNoRequirements() public {
        uint256 airdropId = _setupBasicAirdrop();

        vm.prank(BOB);
        airdropVault.claim(airdropId, 0, bytes32(0));

        assertTrue(airdropVault.hasClaimed(airdropId, BOB));
        assertEq(IERC20(token).balanceOf(BOB), CLAIM_AMOUNT);
    }

    function test_ClaimAirdropWithScoreRequirement() public {
        uint256 airdropId = _setupAirdropWithScoreRequirement(500);

        _registerUser(BOB);

        bytes32 bobSalt = keccak256("bob_salt");
        uint256 bobScore = 750;
        bytes32 bobScoreHash = keccak256(abi.encodePacked(BOB, bobScore, bobSalt));

        vm.prank(DEPLOYER);
        scoreRegistry.updateScore(BOB, bobScoreHash, block.timestamp);

        vm.prank(BOB);
        airdropVault.claim(airdropId, bobScore, bobSalt);

        assertTrue(airdropVault.hasClaimed(airdropId, BOB));
        assertEq(IERC20(token).balanceOf(BOB), CLAIM_AMOUNT);
    }

    function test_RevertWhenScoreTooLow() public {
        uint256 airdropId = _setupAirdropWithScoreRequirement(800);

        _registerUser(BOB);

        bytes32 bobSalt = keccak256("bob_salt");
        uint256 bobScore = 500;
        bytes32 bobScoreHash = keccak256(abi.encodePacked(BOB, bobScore, bobSalt));

        vm.prank(DEPLOYER);
        scoreRegistry.updateScore(BOB, bobScoreHash, block.timestamp);

        vm.prank(BOB);
        vm.expectRevert("Score too low");
        airdropVault.claim(airdropId, bobScore, bobSalt);
    }

    function test_ClaimAirdropWithBadgeRequirement() public {
        uint256 airdropId = _setupAirdropWithBadgeRequirement();

        _registerUser(BOB);
        vm.prank(DEPLOYER);
        badgeNFT.mintBadge(BOB, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        vm.prank(BOB);
        airdropVault.claim(airdropId, 0, bytes32(0));

        assertTrue(airdropVault.hasClaimed(airdropId, BOB));
    }

    function test_RevertWhenMissingBadge() public {
        uint256 airdropId = _setupAirdropWithBadgeRequirement();

        vm.prank(BOB);
        vm.expectRevert("Missing required badge");
        airdropVault.claim(airdropId, 0, bytes32(0));
    }

    function test_CancelAirdrop() public {
        uint256 airdropId = _setupBasicAirdrop();
        uint256 aliceBalanceBefore = IERC20(token).balanceOf(ALICE);

        vm.prank(ALICE);
        airdropVault.cancelAirdrop(airdropId);

        assertFalse(airdropVault.isEligible(airdropId, BOB));
        assertEq(IERC20(token).balanceOf(ALICE), aliceBalanceBefore + AIRDROP_AMOUNT);
    }

    function test_RevertCancelNotCreator() public {
        uint256 airdropId = _setupBasicAirdrop();

        vm.prank(BOB);
        vm.expectRevert(AirdropVault.NotCreator.selector);
        airdropVault.cancelAirdrop(airdropId);
    }

    function test_RevertWhenAirdropExhausted() public {
        _createToken();

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), CLAIM_AMOUNT * 2);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: 0,
            requiredBadges: new uint256[](0),
            minEndorsementWeight: 0,
            requiresRegistration: false
        });

        uint256 airdropId = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            CLAIM_AMOUNT * 2,
            block.timestamp,
            block.timestamp + 7 days,
            criteria,
            ""
        );
        vm.stopPrank();

        vm.prank(BOB);
        airdropVault.claim(airdropId, 0, bytes32(0));

        vm.prank(CHARLIE);
        airdropVault.claim(airdropId, 0, bytes32(0));

        address user4 = makeAddr("user4");
        vm.prank(user4);
        vm.expectRevert(AirdropVault.AirdropExhausted.selector);
        airdropVault.claim(airdropId, 0, bytes32(0));
    }

    function test_RevertWhenAlreadyClaimed() public {
        uint256 airdropId = _setupBasicAirdrop();

        vm.prank(BOB);
        airdropVault.claim(airdropId, 0, bytes32(0));

        vm.prank(BOB);
        vm.expectRevert(AirdropVault.AlreadyClaimed.selector);
        airdropVault.claim(airdropId, 0, bytes32(0));
    }

    function test_RevertWhenAirdropNotStarted() public {
        _createToken();

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), AIRDROP_AMOUNT);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: 0,
            requiredBadges: new uint256[](0),
            minEndorsementWeight: 0,
            requiresRegistration: false
        });

        uint256 airdropId = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            AIRDROP_AMOUNT,
            block.timestamp + 1 days,
            block.timestamp + 7 days,
            criteria,
            ""
        );
        vm.stopPrank();

        vm.prank(BOB);
        vm.expectRevert(AirdropVault.AirdropNotStarted.selector);
        airdropVault.claim(airdropId, 0, bytes32(0));
    }

    function test_RevertWhenAirdropEnded() public {
        uint256 airdropId = _setupBasicAirdrop();

        skip(8 days);

        vm.prank(BOB);
        vm.expectRevert(AirdropVault.AirdropEnded.selector);
        airdropVault.claim(airdropId, 0, bytes32(0));
    }

    function test_IsEligible() public {
        uint256 airdropId = _setupAirdropWithBadgeRequirement();

        assertFalse(airdropVault.isEligible(airdropId, BOB));

        _registerUser(BOB);
        vm.prank(DEPLOYER);
        badgeNFT.mintBadge(BOB, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        assertTrue(airdropVault.isEligible(airdropId, BOB));
    }

    function _createToken() internal {
        vm.prank(ALICE);
        token = tokenFactory.createToken("Airdrop Token", "ADROP", 18, TOTAL_SUPPLY);
    }

    function _registerUser(address user) internal {
        bytes32 userScoreHash = keccak256(abi.encodePacked(user, uint256(100), keccak256("default_salt")));
        vm.prank(user);
        scoreRegistry.selfRegister(userScoreHash);
    }

    function _setupBasicAirdrop() internal returns (uint256) {
        _createToken();

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), AIRDROP_AMOUNT);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: 0,
            requiredBadges: new uint256[](0),
            minEndorsementWeight: 0,
            requiresRegistration: false
        });

        uint256 id = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            AIRDROP_AMOUNT,
            block.timestamp,
            block.timestamp + 7 days,
            criteria,
            ""
        );
        vm.stopPrank();

        return id;
    }

    function _setupAirdropWithScoreRequirement(uint256 minScore) internal returns (uint256) {
        _createToken();

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), AIRDROP_AMOUNT);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: minScore,
            requiredBadges: new uint256[](0),
            minEndorsementWeight: 0,
            requiresRegistration: true
        });

        uint256 id = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            AIRDROP_AMOUNT,
            block.timestamp,
            block.timestamp + 7 days,
            criteria,
            ""
        );
        vm.stopPrank();

        return id;
    }

    function _setupAirdropWithBadgeRequirement() internal returns (uint256) {
        _createToken();

        uint256[] memory requiredBadges = new uint256[](1);
        requiredBadges[0] = uint256(IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        vm.startPrank(ALICE);
        IERC20(token).approve(address(airdropVault), AIRDROP_AMOUNT);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: 0,
            requiredBadges: requiredBadges,
            minEndorsementWeight: 0,
            requiresRegistration: false
        });

        uint256 id = airdropVault.createAirdrop(
            token,
            CLAIM_AMOUNT,
            AIRDROP_AMOUNT,
            block.timestamp,
            block.timestamp + 7 days,
            criteria,
            ""
        );
        vm.stopPrank();

        return id;
    }
}
