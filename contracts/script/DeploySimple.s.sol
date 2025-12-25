// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";
import {FreeMintNFT} from "@/FreeMintNFT.sol";
import {HelloWorld} from "@/HelloWorld.sol";

/// @title DeploySimple
/// @notice Simple deployment script that uses CLI private key
contract DeploySimple is Script {
    function run() public {
        console2.log("Deploying to chain:", block.chainid);
        console2.log("Deployer:", msg.sender);

        vm.startBroadcast();

        // Deploy HelloWorld
        HelloWorld helloWorld = new HelloWorld();
        console2.log("HelloWorld deployed to:", address(helloWorld));

        // Deploy FreeMintToken
        FreeMintToken token = new FreeMintToken(
            "Free Mint Token",
            "FMT",
            1000 ether
        );
        console2.log("FreeMintToken deployed to:", address(token));

        // Deploy FreeMintNFT
        FreeMintNFT nft = new FreeMintNFT(
            "Free Mint NFT",
            "FMNFT",
            10000,
            10,
            "https://api.example.com/nft/"
        );
        console2.log("FreeMintNFT deployed to:", address(nft));

        vm.stopBroadcast();

        console2.log("\n=== DEPLOYMENT COMPLETE ===");
        console2.log("Chain ID:", block.chainid);
    }
}
