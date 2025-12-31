// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title SigUtils
/// @notice Utilities for creating and verifying signatures in tests
contract SigUtils {
    bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    /// @notice EIP-712 Domain
    struct Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    /// @notice Permit struct for EIP-2612
    struct Permit {
        address owner;
        address spender;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

    /// @notice Compute domain separator
    function computeDomainSeparator(Domain memory domain) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                DOMAIN_SEPARATOR_TYPEHASH,
                keccak256(bytes(domain.name)),
                keccak256(bytes(domain.version)),
                domain.chainId,
                domain.verifyingContract
            )
        );
    }

    /// @notice Create permit digest
    function getPermitDigest(
        Domain memory domain,
        Permit memory permit
    ) public pure returns (bytes32) {
        bytes32 domainSeparator = computeDomainSeparator(domain);
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                permit.owner,
                permit.spender,
                permit.value,
                permit.nonce,
                permit.deadline
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    /// @notice Create EIP-191 signed message hash
    function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    /// @notice Create EIP-191 signed message hash for arbitrary data
    function getEthSignedMessageHash(bytes memory data) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                toString(data.length),
                data
            )
        );
    }

    /// @notice Split signature into v, r, s components
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        // EIP-2: Adjust v value
        if (v < 27) {
            v += 27;
        }
    }

    /// @notice Recover signer from signature
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(messageHash, v, r, s);
    }

    /// @notice Convert uint256 to string
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

    /// @notice Create a message hash for typed data
    function getTypedDataHash(
        bytes32 domainSeparator,
        bytes32 structHash
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    /// @notice Helper to create permit signature
    function createPermitSignature(
        uint256 privateKey,
        Domain memory domain,
        Permit memory permit
    ) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        bytes32 digest = getPermitDigest(domain, permit);
        return createSignature(privateKey, digest);
    }

    /// @notice Create signature from private key and message hash
    function createSignature(
        uint256 privateKey,
        bytes32 messageHash
    ) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        // This is a simplified version for testing
        // In production, use proper ECDSA signing
        bytes32 digest = messageHash;
        
        // Placeholder for actual signing logic
        // In tests, you would use vm.sign(privateKey, digest)
        v = 27;
        r = bytes32(uint256(keccak256(abi.encode(privateKey, digest, "r"))));
        s = bytes32(uint256(keccak256(abi.encode(privateKey, digest, "s"))));
    }
}