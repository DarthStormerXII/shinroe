// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";
import {FreeMintNFT} from "@/FreeMintNFT.sol";
import {HelloWorld} from "@/HelloWorld.sol";
import {ScoreRegistry} from "@/ScoreRegistry.sol";
import {BadgeNFT} from "@/BadgeNFT.sol";
import {EndorsementVault} from "@/EndorsementVault.sol";
import {TokenFactory} from "@/TokenFactory.sol";
import {AirdropVault} from "@/AirdropVault.sol";

/// @title DeployVeryChain
/// @notice Complete deployment script for VeryChain mainnet
/// @dev Deploys all Shinroe contracts in correct dependency order
contract DeployVeryChain is Script {
    // ============ Configuration ============

    // FreeMint Token Config
    string constant TOKEN_NAME = "Shinroe Test Token";
    string constant TOKEN_SYMBOL = "SHIN";
    uint256 constant MAX_MINT_AMOUNT = 1000 ether;

    // FreeMint NFT Config
    string constant NFT_NAME = "Shinroe Test NFT";
    string constant NFT_SYMBOL = "SNFT";
    uint256 constant NFT_MAX_SUPPLY = 10000;
    uint256 constant NFT_MAX_PER_WALLET = 10;
    string constant NFT_BASE_URI = "ipfs://QmShinroeTestNFT/";

    // Badge NFT Config
    string constant BADGE_NAME = "Shinroe Reputation Badge";
    string constant BADGE_SYMBOL = "SHINROE";

    // ============ Deployment State ============

    struct DeployedContracts {
        HelloWorld helloWorld;
        FreeMintToken freeMintToken;
        FreeMintNFT freeMintNFT;
        ScoreRegistry scoreRegistry;
        BadgeNFT badgeNFT;
        EndorsementVault endorsementVault;
        TokenFactory tokenFactory;
        AirdropVault airdropVault;
    }

    /// @notice Main deployment entry point
    function run() public returns (DeployedContracts memory contracts) {
        uint256 deployerPrivateKey = _getPrivateKey();
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = deployer; // Treasury receives slashed stakes

        _logDeploymentStart(deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Phase 1: Deploy independent contracts
        contracts.helloWorld = _deployHelloWorld();
        contracts.freeMintToken = _deployFreeMintToken();
        contracts.freeMintNFT = _deployFreeMintNFT();
        contracts.tokenFactory = _deployTokenFactory();

        // Phase 2: Deploy core Shinroe contracts
        contracts.scoreRegistry = _deployScoreRegistry();
        contracts.badgeNFT = _deployBadgeNFT();
        contracts.endorsementVault = _deployEndorsementVault(treasury);

        // Phase 3: Deploy contracts with immutable dependencies
        contracts.airdropVault = _deployAirdropVault(
            address(contracts.scoreRegistry),
            address(contracts.badgeNFT)
        );

        vm.stopBroadcast();

        _logDeploymentSummary(contracts, deployer);

        return contracts;
    }

    /// @notice Dry run deployment for simulation
    function simulate() public returns (DeployedContracts memory) {
        console2.log("\n========================================");
        console2.log("SIMULATION MODE - No transactions sent");
        console2.log("========================================\n");
        return run();
    }

    // ============ Internal Deploy Functions ============

    function _deployHelloWorld() internal returns (HelloWorld) {
        console2.log("Deploying HelloWorld...");
        HelloWorld hw = new HelloWorld();
        console2.log("  -> HelloWorld:", address(hw));
        return hw;
    }

    function _deployFreeMintToken() internal returns (FreeMintToken) {
        console2.log("Deploying FreeMintToken...");
        FreeMintToken token = new FreeMintToken(TOKEN_NAME, TOKEN_SYMBOL, MAX_MINT_AMOUNT);
        console2.log("  -> FreeMintToken:", address(token));
        return token;
    }

    function _deployFreeMintNFT() internal returns (FreeMintNFT) {
        console2.log("Deploying FreeMintNFT...");
        FreeMintNFT nft = new FreeMintNFT(
            NFT_NAME,
            NFT_SYMBOL,
            NFT_MAX_SUPPLY,
            NFT_MAX_PER_WALLET,
            NFT_BASE_URI
        );
        console2.log("  -> FreeMintNFT:", address(nft));
        return nft;
    }

    function _deployScoreRegistry() internal returns (ScoreRegistry) {
        console2.log("Deploying ScoreRegistry...");
        ScoreRegistry registry = new ScoreRegistry();
        console2.log("  -> ScoreRegistry:", address(registry));
        return registry;
    }

    function _deployBadgeNFT() internal returns (BadgeNFT) {
        console2.log("Deploying BadgeNFT...");
        BadgeNFT badge = new BadgeNFT(BADGE_NAME, BADGE_SYMBOL);
        console2.log("  -> BadgeNFT:", address(badge));
        return badge;
    }

    function _deployEndorsementVault(address treasury) internal returns (EndorsementVault) {
        console2.log("Deploying EndorsementVault...");
        console2.log("  - Treasury:", treasury);
        EndorsementVault vault = new EndorsementVault(treasury);
        console2.log("  -> EndorsementVault:", address(vault));
        return vault;
    }

    function _deployTokenFactory() internal returns (TokenFactory) {
        console2.log("Deploying TokenFactory...");
        TokenFactory factory = new TokenFactory();
        console2.log("  -> TokenFactory:", address(factory));
        return factory;
    }

    function _deployAirdropVault(
        address scoreRegistry,
        address badgeNFT
    ) internal returns (AirdropVault) {
        console2.log("Deploying AirdropVault...");
        console2.log("  - ScoreRegistry:", scoreRegistry);
        console2.log("  - BadgeNFT:", badgeNFT);
        AirdropVault vault = new AirdropVault(scoreRegistry, badgeNFT);
        console2.log("  -> AirdropVault:", address(vault));
        return vault;
    }

    // ============ Helpers ============

    function _getPrivateKey() internal view returns (uint256) {
        string memory pkString = vm.envString("PRIVATE_KEY");
        // Handle both with and without 0x prefix
        if (bytes(pkString).length == 64) {
            return vm.parseUint(string.concat("0x", pkString));
        }
        return vm.parseUint(pkString);
    }

    function _logDeploymentStart(address deployer) internal view {
        console2.log("\n========================================");
        console2.log("   VERYCHAIN MAINNET DEPLOYMENT");
        console2.log("========================================");
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("Block:", block.number);
        console2.log("========================================\n");
    }

    function _logDeploymentSummary(
        DeployedContracts memory c,
        address deployer
    ) internal view {
        console2.log("\n========================================");
        console2.log("   DEPLOYMENT COMPLETE");
        console2.log("========================================");
        console2.log("HelloWorld:       ", address(c.helloWorld));
        console2.log("FreeMintToken:    ", address(c.freeMintToken));
        console2.log("FreeMintNFT:      ", address(c.freeMintNFT));
        console2.log("ScoreRegistry:    ", address(c.scoreRegistry));
        console2.log("BadgeNFT:         ", address(c.badgeNFT));
        console2.log("EndorsementVault: ", address(c.endorsementVault));
        console2.log("TokenFactory:     ", address(c.tokenFactory));
        console2.log("AirdropVault:     ", address(c.airdropVault));
        console2.log("========================================");
        console2.log("Treasury:         ", deployer);
        console2.log("========================================\n");

        console2.log("NEXT STEPS:");
        console2.log("1. Run InitializeShinroe.s.sol to configure contracts");
        console2.log("2. Run SeedData.s.sol to seed test data (optional)");
        console2.log("3. Update frontend/constants with addresses");
    }
}
