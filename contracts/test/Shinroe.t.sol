// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "./utils/BaseTest.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {EndorsementVault} from "../src/EndorsementVault.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {IScoreRegistry} from "../src/interfaces/IScoreRegistry.sol";
import {IEndorsementVault} from "../src/interfaces/IEndorsementVault.sol";
import {IBadgeNFT} from "../src/interfaces/IBadgeNFT.sol";

/// @title ShinroeTest
/// @notice Tests for the Shinroe reputation system contracts
contract ShinroeTest is BaseTest {
    ScoreRegistry public scoreRegistry;
    EndorsementVault public endorsementVault;
    BadgeNFT public badgeNFT;

    function setUp() public override {
        super.setUp();

        vm.startPrank(DEPLOYER);
        scoreRegistry = new ScoreRegistry();
        endorsementVault = new EndorsementVault(TREASURY);
        badgeNFT = new BadgeNFT("Shinroe Badges", "SHINROE");
        vm.stopPrank();
    }

    // ============ ScoreRegistry Tests ============

    function test_ScoreRegistry_RegisterUser() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.prank(DEPLOYER);
        scoreRegistry.registerUser(ALICE, scoreHash);

        assertEq(scoreRegistry.getScoreHash(ALICE), scoreHash);
        assertTrue(scoreRegistry.isRegistered(ALICE));
    }

    function test_ScoreRegistry_RegisterUser_RevertAlreadyRegistered() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.startPrank(DEPLOYER);
        scoreRegistry.registerUser(ALICE, scoreHash);

        vm.expectRevert(IScoreRegistry.AlreadyRegistered.selector);
        scoreRegistry.registerUser(ALICE, scoreHash);
        vm.stopPrank();
    }

    function test_ScoreRegistry_UpdateScore() public {
        bytes32 initialHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        bytes32 newHash = keccak256(abi.encodePacked(ALICE, uint256(800), bytes32("salt456")));

        vm.startPrank(DEPLOYER);
        scoreRegistry.registerUser(ALICE, initialHash);
        scoreRegistry.updateScore(ALICE, newHash, block.timestamp);
        vm.stopPrank();

        assertEq(scoreRegistry.getScoreHash(ALICE), newHash);
    }

    function test_ScoreRegistry_VerifyScore() public {
        uint256 score = 750;
        bytes32 salt = bytes32("salt123");
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, score, salt));

        vm.prank(DEPLOYER);
        scoreRegistry.registerUser(ALICE, scoreHash);

        assertTrue(scoreRegistry.verifyScore(ALICE, score, salt));
        assertFalse(scoreRegistry.verifyScore(ALICE, 800, salt));
        assertFalse(scoreRegistry.verifyScore(ALICE, score, bytes32("wrongsalt")));
    }

    function test_ScoreRegistry_SetScorePublic() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.prank(DEPLOYER);
        scoreRegistry.registerUser(ALICE, scoreHash);

        assertFalse(scoreRegistry.isScorePublic(ALICE));

        vm.prank(ALICE);
        scoreRegistry.setScorePublic(true);

        assertTrue(scoreRegistry.isScorePublic(ALICE));
    }

    function test_ScoreRegistry_AuthorizedUpdater() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.prank(DEPLOYER);
        scoreRegistry.addAuthorizedUpdater(BOB);

        vm.prank(BOB);
        scoreRegistry.registerUser(ALICE, scoreHash);

        assertTrue(scoreRegistry.isRegistered(ALICE));
    }

    // ============ EndorsementVault Tests ============

    function test_EndorsementVault_Endorse() public {
        uint256 stakeAmount = 0.05 ether;

        vm.prank(ALICE);
        endorsementVault.endorse{value: stakeAmount}(BOB, IEndorsementVault.EndorsementType.GENERAL);

        IEndorsementVault.Endorsement[] memory endorsements = endorsementVault.getEndorsements(BOB);
        assertEq(endorsements.length, 1);
        assertEq(endorsements[0].endorser, ALICE);
        assertEq(endorsements[0].endorsee, BOB);
        assertEq(endorsements[0].stakeAmount, stakeAmount);
        assertTrue(endorsements[0].active);
    }

    function test_EndorsementVault_Endorse_RevertStakeTooLow() public {
        vm.prank(ALICE);
        vm.expectRevert(IEndorsementVault.StakeTooLow.selector);
        endorsementVault.endorse{value: 0.005 ether}(BOB, IEndorsementVault.EndorsementType.GENERAL);
    }

    function test_EndorsementVault_Endorse_RevertCannotEndorseSelf() public {
        vm.prank(ALICE);
        vm.expectRevert(IEndorsementVault.CannotEndorseSelf.selector);
        endorsementVault.endorse{value: 0.05 ether}(ALICE, IEndorsementVault.EndorsementType.GENERAL);
    }

    function test_EndorsementVault_WithdrawEndorsement_NoDecay() public {
        uint256 stakeAmount = 0.05 ether;

        vm.prank(ALICE);
        endorsementVault.endorse{value: stakeAmount}(BOB, IEndorsementVault.EndorsementType.GENERAL);

        uint256 balanceBefore = ALICE.balance;

        vm.prank(ALICE);
        endorsementVault.withdrawEndorsement(0);

        uint256 balanceAfter = ALICE.balance;
        assertEq(balanceAfter - balanceBefore, stakeAmount);
    }

    function test_EndorsementVault_WithdrawEndorsement_WithDecay() public {
        uint256 stakeAmount = 1 ether;

        vm.prank(ALICE);
        endorsementVault.endorse{value: stakeAmount}(BOB, IEndorsementVault.EndorsementType.GENERAL);

        // Skip 7 months (1 month after decay starts)
        skip(210 days);

        uint256 balanceBefore = ALICE.balance;

        vm.prank(ALICE);
        endorsementVault.withdrawEndorsement(0);

        uint256 balanceAfter = ALICE.balance;
        // Should receive 90% (10% decay after 1 month past grace period)
        assertEq(balanceAfter - balanceBefore, 0.9 ether);
    }

    function test_EndorsementVault_GetEndorsementWeight() public {
        vm.prank(ALICE);
        endorsementVault.endorse{value: 1 ether}(BOB, IEndorsementVault.EndorsementType.GENERAL);

        vm.prank(CHARLIE);
        endorsementVault.endorse{value: 0.5 ether}(BOB, IEndorsementVault.EndorsementType.PROFESSIONAL);

        uint256 weight = endorsementVault.getEndorsementWeight(BOB);
        assertEq(weight, 1.5 ether);
    }

    function test_EndorsementVault_CalculateDecay() public {
        // Set a base timestamp first
        uint256 baseTime = 365 days;
        vm.warp(baseTime);

        // No decay in first 6 months - endorsement created now
        assertEq(endorsementVault.calculateDecay(block.timestamp), 100);

        // Endorsement created 90 days ago - still within grace period
        assertEq(endorsementVault.calculateDecay(block.timestamp - 90 days), 100);

        // Endorsement created 180 days ago - at edge of grace period
        assertEq(endorsementVault.calculateDecay(block.timestamp - 180 days), 100);

        // 10% decay per month after 6 months
        // Endorsement created 210 days ago (1 month past grace)
        assertEq(endorsementVault.calculateDecay(block.timestamp - 210 days), 90);

        // Endorsement created 240 days ago (2 months past grace)
        assertEq(endorsementVault.calculateDecay(block.timestamp - 240 days), 80);
    }

    function test_EndorsementVault_SlashEndorsement() public {
        uint256 stakeAmount = 1 ether;
        uint256 treasuryBefore = TREASURY.balance;

        vm.prank(ALICE);
        endorsementVault.endorse{value: stakeAmount}(BOB, IEndorsementVault.EndorsementType.GENERAL);

        vm.prank(DEPLOYER);
        endorsementVault.slashEndorsement(0);

        IEndorsementVault.Endorsement memory endorsement = endorsementVault.getEndorsement(0);
        assertFalse(endorsement.active);
        assertEq(TREASURY.balance - treasuryBefore, stakeAmount);
    }

    // ============ BadgeNFT Tests ============

    function test_BadgeNFT_MintBadge() public {
        vm.prank(DEPLOYER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        assertTrue(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY));
        assertEq(badgeNFT.balanceOf(ALICE), 1);
    }

    function test_BadgeNFT_MintBadge_RevertBadgeAlreadyOwned() public {
        vm.startPrank(DEPLOYER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        vm.expectRevert(IBadgeNFT.BadgeAlreadyOwned.selector);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        vm.stopPrank();
    }

    function test_BadgeNFT_GetBadges() public {
        vm.startPrank(DEPLOYER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.EARLY_ADOPTER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.ELITE_SCORE);
        vm.stopPrank();

        IBadgeNFT.BadgeType[] memory badges = badgeNFT.getBadges(ALICE);
        assertEq(badges.length, 3);
    }

    function test_BadgeNFT_Soulbound_RevertOnTransfer() public {
        vm.prank(DEPLOYER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        vm.prank(ALICE);
        vm.expectRevert(IBadgeNFT.SoulboundToken.selector);
        badgeNFT.transferFrom(ALICE, BOB, 0);
    }

    function test_BadgeNFT_RevokeBadge() public {
        vm.startPrank(DEPLOYER);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        badgeNFT.revokeBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        vm.stopPrank();

        assertFalse(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY));
        assertEq(badgeNFT.balanceOf(ALICE), 0);
    }

    function test_BadgeNFT_MinterRole() public {
        vm.prank(DEPLOYER);
        badgeNFT.grantMinter(BOB);

        assertTrue(badgeNFT.isMinter(BOB));

        vm.prank(BOB);
        badgeNFT.mintBadge(ALICE, IBadgeNFT.BadgeType.COMMUNITY_BUILDER);

        assertTrue(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.COMMUNITY_BUILDER));
    }

    function test_BadgeNFT_MintBadge_RevertNotMinter() public {
        vm.prank(ALICE);
        vm.expectRevert(IBadgeNFT.NotMinter.selector);
        badgeNFT.mintBadge(BOB, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
    }
}
