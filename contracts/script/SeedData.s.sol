// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";
import {ScoreRegistry} from "@/ScoreRegistry.sol";
import {BadgeNFT} from "@/BadgeNFT.sol";
import {IBadgeNFT} from "@/interfaces/IBadgeNFT.sol";
import {EndorsementVault} from "@/EndorsementVault.sol";
import {IEndorsementVault} from "@/interfaces/IEndorsementVault.sol";
import {TokenFactory} from "@/TokenFactory.sol";
import {AirdropVault} from "@/AirdropVault.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";

/// @title SeedData
/// @notice Comprehensive data seeding for VeryChain deployment
/// @dev Creates 6 users, badges, 15 endorsements, 5 airdrops with claims
///      Uses real IPFS metadata from prepare-seed-data.ts
contract SeedData is Script {
    // ============ Constants ============

    uint256 constant ENDORSEMENT_STAKE = 0.01 ether;

    // Wallet private keys (from seed-wallets.json)
    // WARNING: These are for TESTING ONLY - do not use with real funds
    uint256 constant ALICE_PK = 0x1111111111111111111111111111111111111111111111111111111111111111;
    uint256 constant BOB_PK = 0x2222222222222222222222222222222222222222222222222222222222222222;
    uint256 constant CAROL_PK = 0x3333333333333333333333333333333333333333333333333333333333333333;
    uint256 constant DAVID_PK = 0x4444444444444444444444444444444444444444444444444444444444444444;
    uint256 constant EVE_PK = 0x5555555555555555555555555555555555555555555555555555555555555555;
    uint256 constant FRANK_PK = 0x6666666666666666666666666666666666666666666666666666666666666666;

    // ============ Structs ============

    struct UserData {
        string name;
        uint256 privateKey;
        address addr;
        uint256 score;
        bytes32 salt;
        string profileUri;
    }

    struct Contracts {
        ScoreRegistry scoreRegistry;
        BadgeNFT badgeNFT;
        EndorsementVault endorsementVault;
        AirdropVault airdropVault;
        TokenFactory tokenFactory;
    }

    struct AirdropData {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 claimAmount;
        uint256 poolSize;
        uint256 durationDays;
        uint256 minScore;
        string metadataUri;
    }

    // ============ State ============

    UserData[] internal users;
    address[] internal airdropTokens;

    /// @notice Run full seeding
    function run() public {
        Contracts memory c = _loadContracts();
        _setupUsers();

        console2.log("\n========================================");
        console2.log("   COMPREHENSIVE DATA SEEDING");
        console2.log("========================================");
        console2.log("Users: 6");
        console2.log("========================================\n");

        // Fund all wallets first (from deployer)
        uint256 deployerPk = _getPrivateKey();
        vm.startBroadcast(deployerPk);
        _fundWallets();
        vm.stopBroadcast();

        // Phase 1: Register all users (each signs their own registration)
        _seedAllUsers(c);

        // Phase 2: Mint badges (owner mints to users)
        vm.startBroadcast(deployerPk);
        _seedAllBadges(c);
        vm.stopBroadcast();

        // Phase 3: Create endorsements (users endorse each other)
        _seedAllEndorsements(c);

        // Phase 4: Create airdrops (deployer creates)
        vm.startBroadcast(deployerPk);
        _seedAllAirdrops(c);
        vm.stopBroadcast();

        // Phase 5: Claim airdrops (users claim)
        _seedAirdropClaims(c);

        _logSummary();
    }

    // ============ Setup ============

    function _setupUsers() internal {
        // Load IPFS URIs from environment (set by prepare-seed-data.ts)
        string memory aliceUri = vm.envOr("ALICE_PROFILE_URI", string(""));
        string memory bobUri = vm.envOr("BOB_PROFILE_URI", string(""));
        string memory carolUri = vm.envOr("CAROL_PROFILE_URI", string(""));
        string memory davidUri = vm.envOr("DAVID_PROFILE_URI", string(""));
        string memory eveUri = vm.envOr("EVE_PROFILE_URI", string(""));
        string memory frankUri = vm.envOr("FRANK_PROFILE_URI", string(""));

        users.push(UserData({
            name: "Alice",
            privateKey: ALICE_PK,
            addr: vm.addr(ALICE_PK),
            score: 850,
            salt: keccak256("alice_salt_v1"),
            profileUri: aliceUri
        }));

        users.push(UserData({
            name: "Bob",
            privateKey: BOB_PK,
            addr: vm.addr(BOB_PK),
            score: 720,
            salt: keccak256("bob_salt_v1"),
            profileUri: bobUri
        }));

        users.push(UserData({
            name: "Carol",
            privateKey: CAROL_PK,
            addr: vm.addr(CAROL_PK),
            score: 680,
            salt: keccak256("carol_salt_v1"),
            profileUri: carolUri
        }));

        users.push(UserData({
            name: "David",
            privateKey: DAVID_PK,
            addr: vm.addr(DAVID_PK),
            score: 590,
            salt: keccak256("david_salt_v1"),
            profileUri: davidUri
        }));

        users.push(UserData({
            name: "Eve",
            privateKey: EVE_PK,
            addr: vm.addr(EVE_PK),
            score: 810,
            salt: keccak256("eve_salt_v1"),
            profileUri: eveUri
        }));

        users.push(UserData({
            name: "Frank",
            privateKey: FRANK_PK,
            addr: vm.addr(FRANK_PK),
            score: 450,
            salt: keccak256("frank_salt_v1"),
            profileUri: frankUri
        }));

        // Log wallet addresses
        console2.log("Wallet Addresses:");
        for (uint256 i = 0; i < users.length; i++) {
            console2.log("  %s: %s", users[i].name, users[i].addr);
        }
    }

    function _fundWallets() internal {
        uint256 fundAmount = 1 ether;
        console2.log("\nFunding wallets with %d wei each...", fundAmount);

        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].addr.balance < fundAmount) {
                payable(users[i].addr).transfer(fundAmount);
                console2.log("  Funded %s", users[i].name);
            }
        }
    }

    // ============ Phase 1: User Registration ============

    function _seedAllUsers(Contracts memory c) internal {
        console2.log("\nPHASE 1: Registering 6 users...\n");

        for (uint256 i = 0; i < users.length; i++) {
            UserData memory user = users[i];

            if (c.scoreRegistry.isRegistered(user.addr)) {
                console2.log("  [SKIP] %s already registered", user.name);
                continue;
            }

            bytes32 scoreHash = keccak256(abi.encodePacked(user.addr, user.score, user.salt));

            // User registers themselves
            vm.startBroadcast(user.privateKey);
            c.scoreRegistry.selfRegister(scoreHash);

            // Set profile URI if available
            if (bytes(user.profileUri).length > 0) {
                c.scoreRegistry.setProfileUri(user.profileUri);
            }
            vm.stopBroadcast();

            console2.log("  [OK] %s (score: %d)", user.name, user.score);
        }
    }

    // ============ Phase 2: Badge Minting ============

    function _seedAllBadges(Contracts memory c) internal {
        console2.log("\nPHASE 2: Minting badges...\n");

        // Alice (0): All badges - power user
        _mintBadge(c, 0, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        _mintBadge(c, 0, IBadgeNFT.BadgeType.TRUSTED_TRADER);
        _mintBadge(c, 0, IBadgeNFT.BadgeType.COMMUNITY_BUILDER);
        _mintBadge(c, 0, IBadgeNFT.BadgeType.EARLY_ADOPTER);
        _mintBadge(c, 0, IBadgeNFT.BadgeType.ELITE_SCORE);

        // Bob (1): Verified + Trusted Trader
        _mintBadge(c, 1, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        _mintBadge(c, 1, IBadgeNFT.BadgeType.TRUSTED_TRADER);

        // Carol (2): Verified + Community Builder
        _mintBadge(c, 2, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        _mintBadge(c, 2, IBadgeNFT.BadgeType.COMMUNITY_BUILDER);

        // David (3): Verified + Early Adopter
        _mintBadge(c, 3, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        _mintBadge(c, 3, IBadgeNFT.BadgeType.EARLY_ADOPTER);

        // Eve (4): Verified + Trusted + Elite
        _mintBadge(c, 4, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        _mintBadge(c, 4, IBadgeNFT.BadgeType.TRUSTED_TRADER);
        _mintBadge(c, 4, IBadgeNFT.BadgeType.ELITE_SCORE);

        // Frank (5): Only Verified (new user)
        _mintBadge(c, 5, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        console2.log("  Total badges minted: 16");
    }

    function _mintBadge(Contracts memory c, uint256 userIdx, IBadgeNFT.BadgeType badgeType) internal {
        address user = users[userIdx].addr;

        if (c.badgeNFT.hasBadge(user, badgeType)) {
            return;
        }

        c.badgeNFT.mintBadge(user, badgeType);
    }

    // ============ Phase 3: Endorsements (15 total) ============

    function _seedAllEndorsements(Contracts memory c) internal {
        console2.log("\nPHASE 3: Creating 15 endorsements...\n");

        // Alice endorses everyone (5 endorsements)
        _createEndorsement(c, 0, 1, IEndorsementVault.EndorsementType.PROFESSIONAL);
        _createEndorsement(c, 0, 2, IEndorsementVault.EndorsementType.GENERAL);
        _createEndorsement(c, 0, 3, IEndorsementVault.EndorsementType.FINANCIAL);
        _createEndorsement(c, 0, 4, IEndorsementVault.EndorsementType.PROFESSIONAL);
        _createEndorsement(c, 0, 5, IEndorsementVault.EndorsementType.GENERAL);

        // Bob endorses Alice, Carol, Eve (3 endorsements)
        _createEndorsement(c, 1, 0, IEndorsementVault.EndorsementType.PROFESSIONAL);
        _createEndorsement(c, 1, 2, IEndorsementVault.EndorsementType.GENERAL);
        _createEndorsement(c, 1, 4, IEndorsementVault.EndorsementType.FINANCIAL);

        // Carol endorses Alice, David (2 endorsements)
        _createEndorsement(c, 2, 0, IEndorsementVault.EndorsementType.GENERAL);
        _createEndorsement(c, 2, 3, IEndorsementVault.EndorsementType.PROFESSIONAL);

        // David endorses Alice, Frank (2 endorsements)
        _createEndorsement(c, 3, 0, IEndorsementVault.EndorsementType.GENERAL);
        _createEndorsement(c, 3, 5, IEndorsementVault.EndorsementType.GENERAL);

        // Eve endorses Alice, Bob, Carol (3 endorsements)
        _createEndorsement(c, 4, 0, IEndorsementVault.EndorsementType.PROFESSIONAL);
        _createEndorsement(c, 4, 1, IEndorsementVault.EndorsementType.FINANCIAL);
        _createEndorsement(c, 4, 2, IEndorsementVault.EndorsementType.GENERAL);

        console2.log("  Total endorsements: 15");
        console2.log("  Total staked: %d wei", ENDORSEMENT_STAKE * 15);
    }

    function _createEndorsement(
        Contracts memory c,
        uint256 fromIdx,
        uint256 toIdx,
        IEndorsementVault.EndorsementType eType
    ) internal {
        UserData memory from = users[fromIdx];
        UserData memory to = users[toIdx];

        vm.startBroadcast(from.privateKey);
        c.endorsementVault.endorse{value: ENDORSEMENT_STAKE}(to.addr, eType);
        vm.stopBroadcast();

        console2.log("  %s -> %s (%s)", from.name, to.name, _endorsementName(eType));
    }

    // ============ Phase 4: Create 5 Airdrops ============

    function _seedAllAirdrops(Contracts memory c) internal {
        console2.log("\nPHASE 4: Creating 5 airdrops...\n");

        // Load IPFS metadata URIs from environment
        string memory commUri = vm.envOr("AIRDROP_COMM_URI", string("ipfs://placeholder-comm"));
        string memory eliteUri = vm.envOr("AIRDROP_ELITE_URI", string("ipfs://placeholder-elite"));
        string memory earlyUri = vm.envOr("AIRDROP_EARLY_URI", string("ipfs://placeholder-early"));
        string memory tradeUri = vm.envOr("AIRDROP_TRADE_URI", string("ipfs://placeholder-trade"));
        string memory welcUri = vm.envOr("AIRDROP_WELC_URI", string("ipfs://placeholder-welc"));

        // Airdrop 1: Community reward
        _createAirdrop(c, AirdropData({
            name: "Community Reward Token",
            symbol: "COMM",
            totalSupply: 1_000_000 ether,
            claimAmount: 100 ether,
            poolSize: 10_000 ether,
            durationDays: 30,
            minScore: 0,
            metadataUri: commUri
        }));

        // Airdrop 2: Elite score holders only
        _createAirdrop(c, AirdropData({
            name: "Elite Reward Token",
            symbol: "ELITE",
            totalSupply: 500_000 ether,
            claimAmount: 500 ether,
            poolSize: 5_000 ether,
            durationDays: 14,
            minScore: 800,
            metadataUri: eliteUri
        }));

        // Airdrop 3: Early adopter bonus
        _createAirdrop(c, AirdropData({
            name: "Early Bird Token",
            symbol: "EARLY",
            totalSupply: 250_000 ether,
            claimAmount: 250 ether,
            poolSize: 2_500 ether,
            durationDays: 7,
            minScore: 0,
            metadataUri: earlyUri
        }));

        // Airdrop 4: Trader rewards
        _createAirdrop(c, AirdropData({
            name: "Trader Reward Token",
            symbol: "TRADE",
            totalSupply: 750_000 ether,
            claimAmount: 200 ether,
            poolSize: 8_000 ether,
            durationDays: 60,
            minScore: 600,
            metadataUri: tradeUri
        }));

        // Airdrop 5: Welcome bonus
        _createAirdrop(c, AirdropData({
            name: "Welcome Token",
            symbol: "WELC",
            totalSupply: 2_000_000 ether,
            claimAmount: 50 ether,
            poolSize: 50_000 ether,
            durationDays: 90,
            minScore: 0,
            metadataUri: welcUri
        }));
    }

    function _createAirdrop(Contracts memory c, AirdropData memory data) internal {
        // Create token via factory
        address token = c.tokenFactory.createToken(data.name, data.symbol, 18, data.totalSupply);
        airdropTokens.push(token);

        // Approve airdrop vault
        IERC20(token).approve(address(c.airdropVault), data.poolSize);

        // Setup eligibility criteria
        uint256[] memory requiredBadges = new uint256[](1);
        requiredBadges[0] = uint256(IBadgeNFT.BadgeType.VERIFIED_IDENTITY);

        AirdropVault.EligibilityCriteria memory criteria = AirdropVault.EligibilityCriteria({
            minScore: data.minScore,
            requiredBadges: requiredBadges,
            minEndorsementWeight: 0,
            requiresRegistration: true
        });

        // Create airdrop
        uint256 id = c.airdropVault.createAirdrop(
            token,
            data.claimAmount,
            data.poolSize,
            block.timestamp,
            block.timestamp + (data.durationDays * 1 days),
            criteria,
            data.metadataUri
        );

        console2.log("  [%d] %s (%s)", id, data.name, data.symbol);
        console2.log("      Token: %s", token);
        console2.log("      URI: %s", data.metadataUri);
    }

    // ============ Phase 5: Airdrop Claims ============

    function _seedAirdropClaims(Contracts memory c) internal {
        console2.log("\nPHASE 5: Processing airdrop claims...\n");

        // Airdrop 0 (Community): Alice, Bob, Carol, David claim
        _claimAirdrop(c, 0, 0);
        _claimAirdrop(c, 0, 1);
        _claimAirdrop(c, 0, 2);
        _claimAirdrop(c, 0, 3);

        // Airdrop 1 (Elite - minScore 800): Only Alice, Eve eligible
        _claimAirdrop(c, 1, 0);
        _claimAirdrop(c, 1, 4);

        // Airdrop 2 (Early): Alice, David claim
        _claimAirdrop(c, 2, 0);
        _claimAirdrop(c, 2, 3);

        // Airdrop 3 (Trader - minScore 600): Alice, Bob, Eve eligible
        _claimAirdrop(c, 3, 0);
        _claimAirdrop(c, 3, 1);
        _claimAirdrop(c, 3, 4);

        // Airdrop 4 (Welcome): Everyone claims
        _claimAirdrop(c, 4, 0);
        _claimAirdrop(c, 4, 1);
        _claimAirdrop(c, 4, 2);
        _claimAirdrop(c, 4, 3);
        _claimAirdrop(c, 4, 4);
        _claimAirdrop(c, 4, 5);

        console2.log("  Total claims: 17");
    }

    function _claimAirdrop(Contracts memory c, uint256 airdropId, uint256 userIdx) internal {
        UserData memory user = users[userIdx];

        if (c.airdropVault.hasClaimed(airdropId, user.addr)) {
            return;
        }

        if (!c.airdropVault.isEligible(airdropId, user.addr)) {
            return;
        }

        vm.startBroadcast(user.privateKey);
        c.airdropVault.claim(airdropId, user.score, user.salt);
        vm.stopBroadcast();

        console2.log("  %s claimed airdrop %d", user.name, airdropId);
    }

    // ============ Individual Seeders ============

    function seedUsersOnly() public {
        Contracts memory c = _loadContracts();
        _setupUsers();

        uint256 deployerPk = _getPrivateKey();
        vm.startBroadcast(deployerPk);
        _fundWallets();
        vm.stopBroadcast();

        _seedAllUsers(c);
    }

    function seedBadgesOnly() public {
        Contracts memory c = _loadContracts();
        _setupUsers();

        uint256 deployerPk = _getPrivateKey();
        vm.startBroadcast(deployerPk);
        _seedAllBadges(c);
        vm.stopBroadcast();
    }

    function seedEndorsementsOnly() public {
        Contracts memory c = _loadContracts();
        _setupUsers();
        _seedAllEndorsements(c);
    }

    function seedAirdropsOnly() public {
        Contracts memory c = _loadContracts();
        _setupUsers();

        uint256 deployerPk = _getPrivateKey();
        vm.startBroadcast(deployerPk);
        _seedAllAirdrops(c);
        vm.stopBroadcast();
    }

    // ============ Helpers ============

    function _loadContracts() internal view returns (Contracts memory) {
        return Contracts({
            scoreRegistry: ScoreRegistry(vm.envAddress("SCORE_REGISTRY_ADDRESS")),
            badgeNFT: BadgeNFT(vm.envAddress("BADGE_NFT_ADDRESS")),
            endorsementVault: EndorsementVault(vm.envAddress("ENDORSEMENT_VAULT_ADDRESS")),
            airdropVault: AirdropVault(vm.envAddress("AIRDROP_VAULT_ADDRESS")),
            tokenFactory: TokenFactory(vm.envAddress("TOKEN_FACTORY_ADDRESS"))
        });
    }

    function _getPrivateKey() internal view returns (uint256) {
        string memory pkString = vm.envString("PRIVATE_KEY");
        if (bytes(pkString).length == 64) {
            return vm.parseUint(string.concat("0x", pkString));
        }
        return vm.parseUint(pkString);
    }

    function _endorsementName(IEndorsementVault.EndorsementType t) internal pure returns (string memory) {
        if (t == IEndorsementVault.EndorsementType.GENERAL) return "GENERAL";
        if (t == IEndorsementVault.EndorsementType.FINANCIAL) return "FINANCIAL";
        if (t == IEndorsementVault.EndorsementType.PROFESSIONAL) return "PROFESSIONAL";
        return "UNKNOWN";
    }

    function _logSummary() internal pure {
        console2.log("\n========================================");
        console2.log("   SEEDING COMPLETE");
        console2.log("========================================");
        console2.log("");
        console2.log("Users registered: 6");
        console2.log("  - Alice (score 850) - 5 badges");
        console2.log("  - Bob (score 720) - 2 badges");
        console2.log("  - Carol (score 680) - 2 badges");
        console2.log("  - David (score 590) - 2 badges");
        console2.log("  - Eve (score 810) - 3 badges");
        console2.log("  - Frank (score 450) - 1 badge");
        console2.log("");
        console2.log("Badges minted: 16 total");
        console2.log("Endorsements: 15 (0.15 VERY staked)");
        console2.log("Airdrops: 5 created");
        console2.log("Claims: 17 processed");
        console2.log("========================================\n");
    }
}
