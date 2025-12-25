// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";
import {FreeMintNFT} from "@/FreeMintNFT.sol";
import {HelloWorld} from "@/HelloWorld.sol";
import {ScoreRegistry} from "@/ScoreRegistry.sol";
import {BadgeNFT} from "@/BadgeNFT.sol";
import {EndorsementVault} from "@/EndorsementVault.sol";
import {TokenFactory} from "@/TokenFactory.sol";
import {AirdropVault} from "@/AirdropVault.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployScript
/// @notice Main deployment script for all Shinroe contracts
contract DeployScript is BaseScript {
    // FreeMint Configuration
    string constant TOKEN_NAME = "Free Mint Token";
    string constant TOKEN_SYMBOL = "FMT";
    uint256 constant MAX_MINT_AMOUNT = 1000 ether;

    string constant NFT_NAME = "Free Mint NFT";
    string constant NFT_SYMBOL = "FMNFT";
    uint256 constant NFT_MAX_SUPPLY = 10000;
    uint256 constant NFT_MAX_PER_WALLET = 10;
    string constant NFT_BASE_URI = "https://api.example.com/nft/";

    // Shinroe Badge Configuration
    string constant BADGE_NAME = "Shinroe Badge";
    string constant BADGE_SYMBOL = "SBADGE";

    function run() public returns (address[8] memory deployed) {
        DeploymentConfig memory config = startDeployment();

        // Deploy starter contracts
        HelloWorld helloWorld = deployHelloWorld();
        saveDeployment("HelloWorld", address(helloWorld));
        deployed[0] = address(helloWorld);

        FreeMintToken token = deployFreeMintToken();
        saveDeployment("FreeMintToken", address(token));
        deployed[1] = address(token);

        FreeMintNFT nft = deployFreeMintNFT();
        saveDeployment("FreeMintNFT", address(nft));
        deployed[2] = address(nft);

        // Deploy Shinroe contracts
        ScoreRegistry scoreRegistry = deployScoreRegistry();
        saveDeployment("ScoreRegistry", address(scoreRegistry));
        deployed[3] = address(scoreRegistry);

        BadgeNFT badgeNFT = deployBadgeNFT();
        saveDeployment("BadgeNFT", address(badgeNFT));
        deployed[4] = address(badgeNFT);

        EndorsementVault endorsementVault = deployEndorsementVault(config.deployer);
        saveDeployment("EndorsementVault", address(endorsementVault));
        deployed[5] = address(endorsementVault);

        TokenFactory tokenFactory = deployTokenFactory();
        saveDeployment("TokenFactory", address(tokenFactory));
        deployed[6] = address(tokenFactory);

        AirdropVault airdropVault = deployAirdropVault(address(scoreRegistry), address(badgeNFT));
        saveDeployment("AirdropVault", address(airdropVault));
        deployed[7] = address(airdropVault);

        // Configure Shinroe contracts
        configureShinroeContracts(scoreRegistry, badgeNFT, endorsementVault);

        endDeployment();

        console2.log("\n=== DEPLOYMENT COMPLETE ===");
        console2.log("HelloWorld:", address(helloWorld));
        console2.log("FreeMintToken:", address(token));
        console2.log("FreeMintNFT:", address(nft));
        console2.log("ScoreRegistry:", address(scoreRegistry));
        console2.log("BadgeNFT:", address(badgeNFT));
        console2.log("EndorsementVault:", address(endorsementVault));
        console2.log("TokenFactory:", address(tokenFactory));
        console2.log("AirdropVault:", address(airdropVault));
        console2.log("Chain ID:", block.chainid);

        return deployed;
    }

    function deployHelloWorld() internal returns (HelloWorld) {
        console2.log("\nDeploying HelloWorld...");
        HelloWorld helloWorld = new HelloWorld();
        console2.log("HelloWorld deployed to:", address(helloWorld));
        return helloWorld;
    }

    function deployFreeMintToken() internal returns (FreeMintToken) {
        console2.log("\nDeploying FreeMintToken...");
        FreeMintToken token = new FreeMintToken(TOKEN_NAME, TOKEN_SYMBOL, MAX_MINT_AMOUNT);
        console2.log("FreeMintToken deployed to:", address(token));
        return token;
    }

    function deployFreeMintNFT() internal returns (FreeMintNFT) {
        console2.log("\nDeploying FreeMintNFT...");
        FreeMintNFT nft = new FreeMintNFT(NFT_NAME, NFT_SYMBOL, NFT_MAX_SUPPLY, NFT_MAX_PER_WALLET, NFT_BASE_URI);
        console2.log("FreeMintNFT deployed to:", address(nft));
        return nft;
    }

    function deployScoreRegistry() internal returns (ScoreRegistry) {
        console2.log("\nDeploying ScoreRegistry...");
        ScoreRegistry scoreRegistry = new ScoreRegistry();
        console2.log("ScoreRegistry deployed to:", address(scoreRegistry));
        return scoreRegistry;
    }

    function deployBadgeNFT() internal returns (BadgeNFT) {
        console2.log("\nDeploying BadgeNFT...");
        BadgeNFT badgeNFT = new BadgeNFT(BADGE_NAME, BADGE_SYMBOL);
        console2.log("BadgeNFT deployed to:", address(badgeNFT));
        return badgeNFT;
    }

    function deployEndorsementVault(address treasury) internal returns (EndorsementVault) {
        console2.log("\nDeploying EndorsementVault...");
        console2.log("- Treasury:", treasury);
        EndorsementVault vault = new EndorsementVault(treasury);
        console2.log("EndorsementVault deployed to:", address(vault));
        return vault;
    }

    function deployTokenFactory() internal returns (TokenFactory) {
        console2.log("\nDeploying TokenFactory...");
        TokenFactory factory = new TokenFactory();
        console2.log("TokenFactory deployed to:", address(factory));
        return factory;
    }

    function deployAirdropVault(address scoreRegistry, address badgeNFT) internal returns (AirdropVault) {
        console2.log("\nDeploying AirdropVault...");
        console2.log("- ScoreRegistry:", scoreRegistry);
        console2.log("- BadgeNFT:", badgeNFT);
        AirdropVault vault = new AirdropVault(scoreRegistry, badgeNFT);
        console2.log("AirdropVault deployed to:", address(vault));
        return vault;
    }

    function configureShinroeContracts(
        ScoreRegistry scoreRegistry,
        BadgeNFT badgeNFT,
        EndorsementVault endorsementVault
    ) internal {
        console2.log("\n=== CONFIGURING CONTRACTS ===");

        // Set ScoreRegistry on BadgeNFT
        badgeNFT.setScoreRegistry(address(scoreRegistry));
        console2.log("BadgeNFT.setScoreRegistry:", address(scoreRegistry));

        // Set ScoreRegistry on EndorsementVault
        endorsementVault.setScoreRegistry(address(scoreRegistry));
        console2.log("EndorsementVault.setScoreRegistry:", address(scoreRegistry));

        // Add BadgeNFT as authorized updater on ScoreRegistry
        scoreRegistry.addAuthorizedUpdater(address(badgeNFT));
        console2.log("ScoreRegistry.addAuthorizedUpdater(BadgeNFT):", address(badgeNFT));

        // Add EndorsementVault as authorized updater on ScoreRegistry
        scoreRegistry.addAuthorizedUpdater(address(endorsementVault));
        console2.log("ScoreRegistry.addAuthorizedUpdater(EndorsementVault):", address(endorsementVault));

        console2.log("Configuration complete");
    }
}
