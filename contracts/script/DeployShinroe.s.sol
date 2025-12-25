// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ScoreRegistry} from "@/ScoreRegistry.sol";
import {EndorsementVault} from "@/EndorsementVault.sol";
import {BadgeNFT} from "@/BadgeNFT.sol";

/// @title DeployShinroeScript
/// @notice Deploys Shinroe reputation system contracts to Polygon Amoy
contract DeployShinroeScript is Script {
    // Configuration
    string constant BADGE_NFT_NAME = "Shinroe Badges";
    string constant BADGE_NFT_SYMBOL = "SHINROE";

    /// @notice Main deployment function
    function run()
        public
        returns (ScoreRegistry scoreRegistry, EndorsementVault endorsementVault, BadgeNFT badgeNFT)
    {
        // Read private key as string, then parse (handles with or without 0x prefix)
        string memory pkString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string.concat("0x", pkString));
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("====================================");
        console2.log("Deployer address:", deployer);
        console2.log("Chain ID:", block.chainid);
        console2.log("====================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ScoreRegistry
        console2.log("\nDeploying ScoreRegistry...");
        scoreRegistry = new ScoreRegistry();
        console2.log("ScoreRegistry deployed to:", address(scoreRegistry));

        // 2. Deploy EndorsementVault (treasury = deployer)
        console2.log("\nDeploying EndorsementVault...");
        endorsementVault = new EndorsementVault(deployer);
        console2.log("EndorsementVault deployed to:", address(endorsementVault));

        // 3. Deploy BadgeNFT
        console2.log("\nDeploying BadgeNFT...");
        badgeNFT = new BadgeNFT(BADGE_NFT_NAME, BADGE_NFT_SYMBOL);
        console2.log("BadgeNFT deployed to:", address(badgeNFT));

        // 4. Link contracts
        // Set ScoreRegistry on BadgeNFT for registration verification
        badgeNFT.setScoreRegistry(address(scoreRegistry));
        console2.log("Set ScoreRegistry on BadgeNFT for registration verification");

        // Grant ScoreRegistry as minter on BadgeNFT (for admin minting other badges)
        badgeNFT.grantMinter(address(scoreRegistry));
        console2.log("Granted ScoreRegistry as minter on BadgeNFT");

        vm.stopBroadcast();

        // Log summary
        console2.log("\n=== SHINROE DEPLOYMENT COMPLETE ===");
        console2.log("ScoreRegistry:", address(scoreRegistry));
        console2.log("EndorsementVault:", address(endorsementVault));
        console2.log("BadgeNFT:", address(badgeNFT));
        console2.log("Treasury:", deployer);

        return (scoreRegistry, endorsementVault, badgeNFT);
    }
}
