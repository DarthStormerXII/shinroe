// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title EIP712Example
/// @notice Example implementation of EIP-712 typed structured data signing
/// @dev Implements domain separator and typed data hashing for gasless transactions
contract EIP712Example {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice EIP-712 Domain Separator
    bytes32 private constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    /// @notice Permit typehash for gasless approvals
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    /// @notice Meta transaction typehash
    bytes32 public constant META_TRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
    );

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Domain separator for this contract
    bytes32 public immutable DOMAIN_SEPARATOR;

    /// @notice Contract name for EIP-712
    string public constant name = "EIP712Example";

    /// @notice Contract version for EIP-712
    string public constant version = "1";

    /// @notice Nonces for replay protection
    mapping(address => uint256) public nonces;

    /// @notice Example state that can be modified via meta transactions
    mapping(address => uint256) public balances;

    /// @notice Allowances for permit functionality
    mapping(address => mapping(address => uint256)) public allowances;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidSignature();
    error SignatureExpired();
    error InvalidNonce();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event MetaTransactionExecuted(
        address indexed from,
        address indexed relayer,
        bytes functionSignature
    );

    event PermitUsed(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                block.chainid,
                address(this)
            )
        );
    }

    /*//////////////////////////////////////////////////////////////
                           PERMIT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Approve tokens via signature (EIP-2612 style)
    /// @param owner Token owner
    /// @param spender Address to approve
    /// @param value Amount to approve
    /// @param deadline Signature expiration timestamp
    /// @param v Signature v
    /// @param r Signature r
    /// @param s Signature s
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > deadline) revert SignatureExpired();

        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        if (recoveredAddress == address(0) || recoveredAddress != owner) {
            revert InvalidSignature();
        }

        allowances[owner][spender] = value;
        emit PermitUsed(owner, spender, value);
    }

    /*//////////////////////////////////////////////////////////////
                      META TRANSACTION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Execute a meta transaction
    /// @param from Address that signed the transaction
    /// @param functionSignature Encoded function call
    /// @param sigR Signature r
    /// @param sigS Signature s
    /// @param sigV Signature v
    function executeMetaTransaction(
        address from,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) external returns (bytes memory) {
        // Verify the signature
        bytes32 digest = getMetaTransactionDigest(from, functionSignature);
        address signer = ecrecover(digest, sigV, sigR, sigS);
        
        if (signer == address(0) || signer != from) {
            revert InvalidSignature();
        }

        // Increment nonce
        nonces[from]++;

        // Execute the transaction
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, from)
        );
        
        require(success, "Meta transaction execution failed");

        emit MetaTransactionExecuted(from, msg.sender, functionSignature);
        
        return returnData;
    }

    /// @notice Get digest for meta transaction
    function getMetaTransactionDigest(
        address from,
        bytes memory functionSignature
    ) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                META_TRANSACTION_TYPEHASH,
                nonces[from],
                from,
                keccak256(functionSignature)
            )
        );

        return keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
    }

    /*//////////////////////////////////////////////////////////////
                         EXAMPLE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Example function that can be called via meta transaction
    /// @dev The actual sender is appended to the calldata by executeMetaTransaction
    function setBalance(uint256 newBalance) external {
        address user = msgSender();
        balances[user] = newBalance;
    }

    /// @notice Transfer balance using allowance
    function transferFrom(address from, address to, uint256 amount) external {
        address spender = msgSender();
        
        uint256 allowed = allowances[from][spender];
        require(allowed >= amount, "Insufficient allowance");
        
        require(balances[from] >= amount, "Insufficient balance");
        
        allowances[from][spender] = allowed - amount;
        balances[from] -= amount;
        balances[to] += amount;
    }

    /// @notice Get actual message sender (works with meta transactions)
    function msgSender() internal view returns (address sender) {
        if (msg.sender == address(this)) {
            // Meta transaction: extract appended sender
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                sender := mload(add(array, index))
            }
        } else {
            sender = msg.sender;
        }
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get current nonce for an address
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    /// @notice Verify a permit signature without executing
    function verifyPermit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bool) {
        if (block.timestamp > deadline) return false;

        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner],
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        return recoveredAddress != address(0) && recoveredAddress == owner;
    }

    /// @notice Get EIP-712 domain separator
    function getDomainSeparator() external view returns (bytes32) {
        return DOMAIN_SEPARATOR;
    }

    /// @notice Get chain ID
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }
}