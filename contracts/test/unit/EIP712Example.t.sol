// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {EIP712Example} from "@/EIP712Example.sol";
import {SigUtils} from "../utils/SigUtils.sol";

/// @title EIP712ExampleTest
/// @notice Tests for EIP-712 typed structured data signing
contract EIP712ExampleTest is BaseTest {
    EIP712Example public eip712;
    SigUtils internal sigUtils;

    uint256 internal ownerPrivateKey;
    address internal owner;

    uint256 internal spenderPrivateKey;
    address internal spender;

    function setUp() public override {
        super.setUp();

        // Deploy contract
        eip712 = new EIP712Example();

        // Setup signature utils
        sigUtils = new SigUtils();

        // Setup test accounts
        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);

        spenderPrivateKey = 0xB0B;
        spender = vm.addr(spenderPrivateKey);

        // Fund accounts
        vm.deal(owner, 100 ether);
        vm.deal(spender, 100 ether);

        // Label accounts
        vm.label(owner, "Owner");
        vm.label(spender, "Spender");
    }

    /*//////////////////////////////////////////////////////////////
                            PERMIT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Permit() public {
        uint256 value = 1000;
        uint256 deadline = block.timestamp + 1 days;
        uint256 nonce = eip712.nonces(owner);

        // Create permit digest
        SigUtils.Domain memory domain = SigUtils.Domain({
            name: "EIP712Example",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(eip712)
        });

        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: owner,
            spender: spender,
            value: value,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = sigUtils.getPermitDigest(domain, permit);

        // Sign the digest
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        // Execute permit
        eip712.permit(owner, spender, value, deadline, v, r, s);

        // Verify allowance was set
        assertEq(eip712.allowances(owner, spender), value);
        assertEq(eip712.nonces(owner), nonce + 1);
    }

    function test_Permit_RevertWhen_ExpiredDeadline() public {
        uint256 value = 1000;
        uint256 deadline = block.timestamp - 1; // Expired
        uint256 nonce = eip712.nonces(owner);

        // Create permit
        SigUtils.Domain memory domain = SigUtils.Domain({
            name: "EIP712Example",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(eip712)
        });

        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: owner,
            spender: spender,
            value: value,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = sigUtils.getPermitDigest(domain, permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        // Expect revert
        vm.expectRevert(EIP712Example.SignatureExpired.selector);
        eip712.permit(owner, spender, value, deadline, v, r, s);
    }

    function test_Permit_RevertWhen_InvalidSignature() public {
        uint256 value = 1000;
        uint256 deadline = block.timestamp + 1 days;

        // Sign with wrong private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spenderPrivateKey, "wrong digest");

        vm.expectRevert(EIP712Example.InvalidSignature.selector);
        eip712.permit(owner, spender, value, deadline, v, r, s);
    }

    /*//////////////////////////////////////////////////////////////
                       META TRANSACTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_MetaTransaction() public {
        // Set initial balance
        vm.prank(owner);
        eip712.setBalance(1000);
        assertEq(eip712.balances(owner), 1000);

        // Prepare meta transaction
        uint256 newBalance = 2000;
        bytes memory functionSignature = abi.encodeWithSelector(
            EIP712Example.setBalance.selector,
            newBalance
        );

        bytes32 digest = eip712.getMetaTransactionDigest(owner, functionSignature);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        // Execute meta transaction as relayer
        vm.prank(ALICE); // Alice is the relayer
        eip712.executeMetaTransaction(owner, functionSignature, r, s, v);

        // Verify balance was updated
        assertEq(eip712.balances(owner), newBalance);
        assertEq(eip712.nonces(owner), 1);
    }

    function test_MetaTransaction_RevertWhen_InvalidSignature() public {
        bytes memory functionSignature = abi.encodeWithSelector(
            EIP712Example.setBalance.selector,
            1000
        );

        // Sign with wrong key
        bytes32 digest = eip712.getMetaTransactionDigest(owner, functionSignature);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spenderPrivateKey, digest);

        vm.expectRevert(EIP712Example.InvalidSignature.selector);
        eip712.executeMetaTransaction(owner, functionSignature, r, s, v);
    }

    /*//////////////////////////////////////////////////////////////
                         INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_PermitAndTransfer() public {
        // Setup: give owner some balance
        vm.prank(owner);
        eip712.setBalance(1000);

        // Step 1: Owner signs permit for spender
        uint256 allowance = 500;
        uint256 deadline = block.timestamp + 1 days;

        SigUtils.Domain memory domain = SigUtils.Domain({
            name: "EIP712Example",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(eip712)
        });

        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: owner,
            spender: spender,
            value: allowance,
            nonce: eip712.nonces(owner),
            deadline: deadline
        });

        bytes32 digest = sigUtils.getPermitDigest(domain, permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        // Step 2: Anyone can submit the permit
        vm.prank(ALICE);
        eip712.permit(owner, spender, allowance, deadline, v, r, s);

        // Step 3: Spender transfers tokens
        vm.prank(spender);
        eip712.transferFrom(owner, BOB, 300);

        // Verify final state
        assertEq(eip712.balances(owner), 700);
        assertEq(eip712.balances(BOB), 300);
        assertEq(eip712.allowances(owner, spender), 200);
    }

    /*//////////////////////////////////////////////////////////////
                              FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_Permit(
        uint256 privateKey,
        uint256 value,
        uint256 deadline
    ) public {
        // Bound inputs
        privateKey = bound(privateKey, 1, type(uint256).max - 1);
        deadline = bound(deadline, block.timestamp + 1, type(uint256).max);
        
        address signer = vm.addr(privateKey);
        
        // Create and sign permit
        SigUtils.Domain memory domain = SigUtils.Domain({
            name: "EIP712Example",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(eip712)
        });

        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: signer,
            spender: spender,
            value: value,
            nonce: eip712.nonces(signer),
            deadline: deadline
        });

        bytes32 digest = sigUtils.getPermitDigest(domain, permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        // Execute permit
        eip712.permit(signer, spender, value, deadline, v, r, s);

        // Verify
        assertEq(eip712.allowances(signer, spender), value);
    }

    /*//////////////////////////////////////////////////////////////
                           HELPER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_VerifyPermit() public {
        uint256 value = 1000;
        uint256 deadline = block.timestamp + 1 days;

        // Create valid signature
        SigUtils.Domain memory domain = SigUtils.Domain({
            name: "EIP712Example",
            version: "1",
            chainId: block.chainid,
            verifyingContract: address(eip712)
        });

        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: owner,
            spender: spender,
            value: value,
            nonce: eip712.nonces(owner),
            deadline: deadline
        });

        bytes32 digest = sigUtils.getPermitDigest(domain, permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        // Verify without executing
        bool isValid = eip712.verifyPermit(owner, spender, value, deadline, v, r, s);
        assertTrue(isValid);

        // Verify with wrong signer
        isValid = eip712.verifyPermit(spender, spender, value, deadline, v, r, s);
        assertFalse(isValid);
    }

    function test_DomainSeparator() public {
        bytes32 expectedDomainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("EIP712Example")),
                keccak256(bytes("1")),
                block.chainid,
                address(eip712)
            )
        );

        assertEq(eip712.DOMAIN_SEPARATOR(), expectedDomainSeparator);
        assertEq(eip712.getDomainSeparator(), expectedDomainSeparator);
    }
}