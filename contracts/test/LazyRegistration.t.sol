// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "./utils/BaseTest.sol";
import {ScoreRegistry} from "../src/ScoreRegistry.sol";
import {EndorsementVault} from "../src/EndorsementVault.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {IScoreRegistry} from "../src/interfaces/IScoreRegistry.sol";
import {IEndorsementVault} from "../src/interfaces/IEndorsementVault.sol";
import {IBadgeNFT} from "../src/interfaces/IBadgeNFT.sol";

/// @title LazyRegistrationTest
/// @notice Tests for lazy on-chain registration - users register on first action
contract LazyRegistrationTest is BaseTest {
    ScoreRegistry public scoreRegistry;
    EndorsementVault public endorsementVault;
    BadgeNFT public badgeNFT;

    function setUp() public override {
        super.setUp();

        vm.startPrank(DEPLOYER);
        scoreRegistry = new ScoreRegistry();
        endorsementVault = new EndorsementVault(TREASURY);
        badgeNFT = new BadgeNFT("Shinroe Badges", "SHINROE");

        // Configure contracts for lazy registration
        endorsementVault.setScoreRegistry(address(scoreRegistry));
        badgeNFT.setScoreRegistry(address(scoreRegistry));

        // Add EndorsementVault and BadgeNFT as authorized updaters
        scoreRegistry.addAuthorizedUpdater(address(endorsementVault));
        scoreRegistry.addAuthorizedUpdater(address(badgeNFT));
        vm.stopPrank();
    }

    // ============ ScoreRegistry.registerAndUpdateScore Tests ============

    function test_RegisterAndUpdateScore_NewRegistration() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        assertFalse(scoreRegistry.isRegistered(ALICE));

        vm.prank(ALICE);
        scoreRegistry.registerAndUpdateScore(scoreHash);

        assertTrue(scoreRegistry.isRegistered(ALICE));
        assertEq(scoreRegistry.getScoreHash(ALICE), scoreHash);
        assertEq(scoreRegistry.getRegistrationTimestamp(ALICE), block.timestamp);
    }

    function test_RegisterAndUpdateScore_UpdateExistingScore() public {
        bytes32 initialHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        bytes32 newHash = keccak256(abi.encodePacked(ALICE, uint256(850), bytes32("salt456")));

        // First call - registers
        vm.prank(ALICE);
        scoreRegistry.registerAndUpdateScore(initialHash);

        uint256 registrationTime = scoreRegistry.getRegistrationTimestamp(ALICE);

        // Skip some time
        skip(1 days);

        // Second call - updates (not re-registers)
        vm.prank(ALICE);
        scoreRegistry.registerAndUpdateScore(newHash);

        // Registration timestamp should NOT change
        assertEq(scoreRegistry.getRegistrationTimestamp(ALICE), registrationTime);
        // Score should be updated
        assertEq(scoreRegistry.getScoreHash(ALICE), newHash);
        // Last update should be current time
        assertEq(scoreRegistry.getLastUpdateTimestamp(ALICE), block.timestamp);
    }

    function test_RegisterAndUpdateScore_RevertInvalidScoreHash() public {
        vm.prank(ALICE);
        vm.expectRevert(IScoreRegistry.InvalidScoreHash.selector);
        scoreRegistry.registerAndUpdateScore(bytes32(0));
    }

    function test_RegisterUserIfNeeded_Idempotent() public {
        bytes32 scoreHash1 = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        bytes32 scoreHash2 = keccak256(abi.encodePacked(ALICE, uint256(850), bytes32("salt456")));

        vm.startPrank(DEPLOYER);
        // First call - registers
        scoreRegistry.registerUserIfNeeded(ALICE, scoreHash1);
        uint256 registrationTime = scoreRegistry.getRegistrationTimestamp(ALICE);

        skip(1 days);

        // Second call - should NOT update (idempotent, different from registerAndUpdateScore)
        scoreRegistry.registerUserIfNeeded(ALICE, scoreHash2);
        vm.stopPrank();

        // Score should still be the first one
        assertEq(scoreRegistry.getScoreHash(ALICE), scoreHash1);
        assertEq(scoreRegistry.getRegistrationTimestamp(ALICE), registrationTime);
    }

    // ============ EndorsementVault.endorseWithAutoRegister Tests ============

    function test_EndorseWithAutoRegister_AutoRegisters() public {
        bytes32 senderScoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        uint256 stakeAmount = 0.05 ether;

        // Alice is not registered
        assertFalse(scoreRegistry.isRegistered(ALICE));

        vm.prank(ALICE);
        endorsementVault.endorseWithAutoRegister{value: stakeAmount}(
            BOB,
            IEndorsementVault.EndorsementType.GENERAL,
            senderScoreHash
        );

        // Alice should now be registered
        assertTrue(scoreRegistry.isRegistered(ALICE));
        assertEq(scoreRegistry.getScoreHash(ALICE), senderScoreHash);

        // Endorsement should be created
        IEndorsementVault.Endorsement[] memory endorsements = endorsementVault.getEndorsements(BOB);
        assertEq(endorsements.length, 1);
        assertEq(endorsements[0].endorser, ALICE);
    }

    function test_EndorseWithAutoRegister_AlreadyRegistered() public {
        bytes32 initialHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        bytes32 differentHash = keccak256(abi.encodePacked(ALICE, uint256(850), bytes32("salt456")));
        uint256 stakeAmount = 0.05 ether;

        // Pre-register Alice
        vm.prank(ALICE);
        scoreRegistry.selfRegister(initialHash);

        uint256 registrationTime = scoreRegistry.getRegistrationTimestamp(ALICE);

        skip(1 days);

        // Endorse with different score hash
        vm.prank(ALICE);
        endorsementVault.endorseWithAutoRegister{value: stakeAmount}(
            BOB,
            IEndorsementVault.EndorsementType.GENERAL,
            differentHash
        );

        // Registration should NOT change (idempotent)
        assertEq(scoreRegistry.getScoreHash(ALICE), initialHash);
        assertEq(scoreRegistry.getRegistrationTimestamp(ALICE), registrationTime);

        // Endorsement should still be created
        IEndorsementVault.Endorsement[] memory endorsements = endorsementVault.getEndorsements(BOB);
        assertEq(endorsements.length, 1);
    }

    function test_EndorseWithAutoRegister_RevertStakeTooLow() public {
        bytes32 senderScoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.prank(ALICE);
        vm.expectRevert(IEndorsementVault.StakeTooLow.selector);
        endorsementVault.endorseWithAutoRegister{value: 0.005 ether}(
            BOB,
            IEndorsementVault.EndorsementType.GENERAL,
            senderScoreHash
        );
    }

    function test_EndorseWithAutoRegister_RevertCannotEndorseSelf() public {
        bytes32 senderScoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.prank(ALICE);
        vm.expectRevert(IEndorsementVault.CannotEndorseSelf.selector);
        endorsementVault.endorseWithAutoRegister{value: 0.05 ether}(
            ALICE,
            IEndorsementVault.EndorsementType.GENERAL,
            senderScoreHash
        );
    }

    // ============ BadgeNFT.claimVerifiedIdentityBadgeWithAutoRegister Tests ============

    function test_ClaimBadgeWithAutoRegister_AutoRegisters() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        // Alice is not registered
        assertFalse(scoreRegistry.isRegistered(ALICE));
        assertFalse(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY));

        vm.prank(ALICE);
        badgeNFT.claimVerifiedIdentityBadgeWithAutoRegister(scoreHash);

        // Alice should now be registered
        assertTrue(scoreRegistry.isRegistered(ALICE));
        assertEq(scoreRegistry.getScoreHash(ALICE), scoreHash);

        // Badge should be minted
        assertTrue(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY));
        assertEq(badgeNFT.balanceOf(ALICE), 1);
    }

    function test_ClaimBadgeWithAutoRegister_AlreadyRegistered() public {
        bytes32 initialHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        bytes32 differentHash = keccak256(abi.encodePacked(ALICE, uint256(850), bytes32("salt456")));

        // Pre-register Alice
        vm.prank(ALICE);
        scoreRegistry.selfRegister(initialHash);

        uint256 registrationTime = scoreRegistry.getRegistrationTimestamp(ALICE);

        skip(1 days);

        // Claim badge with different score hash
        vm.prank(ALICE);
        badgeNFT.claimVerifiedIdentityBadgeWithAutoRegister(differentHash);

        // Registration should NOT change (idempotent)
        assertEq(scoreRegistry.getScoreHash(ALICE), initialHash);
        assertEq(scoreRegistry.getRegistrationTimestamp(ALICE), registrationTime);

        // Badge should still be minted
        assertTrue(badgeNFT.hasBadge(ALICE, IBadgeNFT.BadgeType.VERIFIED_IDENTITY));
    }

    function test_ClaimBadgeWithAutoRegister_RevertBadgeAlreadyOwned() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        vm.startPrank(ALICE);
        badgeNFT.claimVerifiedIdentityBadgeWithAutoRegister(scoreHash);

        vm.expectRevert(IBadgeNFT.BadgeAlreadyOwned.selector);
        badgeNFT.claimVerifiedIdentityBadgeWithAutoRegister(scoreHash);
        vm.stopPrank();
    }

    function test_ClaimBadgeWithAutoRegister_RevertScoreRegistryNotSet() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));

        // Deploy new BadgeNFT without setting ScoreRegistry
        vm.prank(DEPLOYER);
        BadgeNFT newBadgeNFT = new BadgeNFT("Test Badges", "TEST");

        vm.prank(ALICE);
        vm.expectRevert(IBadgeNFT.ScoreRegistryNotSet.selector);
        newBadgeNFT.claimVerifiedIdentityBadgeWithAutoRegister(scoreHash);
    }

    // ============ Gas Optimization Tests ============

    function test_NoDoubleRegistration_GasOptimized() public {
        bytes32 scoreHash = keccak256(abi.encodePacked(ALICE, uint256(750), bytes32("salt123")));
        uint256 stakeAmount = 0.05 ether;

        // First endorsement - registers Alice
        vm.prank(ALICE);
        uint256 gasStart1 = gasleft();
        endorsementVault.endorseWithAutoRegister{value: stakeAmount}(
            BOB,
            IEndorsementVault.EndorsementType.GENERAL,
            scoreHash
        );
        uint256 gasUsed1 = gasStart1 - gasleft();

        // Second endorsement - Alice already registered
        vm.prank(ALICE);
        uint256 gasStart2 = gasleft();
        endorsementVault.endorseWithAutoRegister{value: stakeAmount}(
            CHARLIE,
            IEndorsementVault.EndorsementType.PROFESSIONAL,
            scoreHash
        );
        uint256 gasUsed2 = gasStart2 - gasleft();

        // Second call should use less gas (no registration)
        assertTrue(gasUsed2 < gasUsed1, "Second endorsement should use less gas");
    }
}
