"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ExpandableCardDemo() {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto p-4">
      {cards.map((card) => (
        <Dialog key={card.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <Badge variant={card.badge.variant as any}>{card.badge.text}</Badge>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{card.title}</DialogTitle>
              <DialogDescription>{card.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-md overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="prose max-w-none dark:prose-invert">
                {card.content}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.open(card.link, '_blank')}>
                  Learn More
                </Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

const cards = [
  {
    id: 1,
    title: "DeFi Dashboard",
    description: "Track your DeFi portfolio across multiple chains",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
    badge: { text: "Popular", variant: "default" },
    content: (
      <div className="space-y-2">
        <p>
          A comprehensive DeFi dashboard that allows you to track your investments,
          yields, and liquidity positions across multiple blockchain networks.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Real-time portfolio tracking</li>
          <li>APY calculations and yield optimization</li>
          <li>Multi-chain support</li>
          <li>Transaction history and analytics</li>
        </ul>
      </div>
    ),
    link: "https://example.com/defi-dashboard"
  },
  {
    id: 2,
    title: "NFT Marketplace",
    description: "Buy, sell, and trade NFTs with ease",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=500&h=300&fit=crop",
    badge: { text: "New", variant: "secondary" },
    content: (
      <div className="space-y-2">
        <p>
          A decentralized NFT marketplace built on Ethereum and Polygon networks.
          Features include lazy minting, royalty settings, and auction functionality.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Low gas fees with Polygon support</li>
          <li>Creator royalties</li>
          <li>Auction and fixed-price listings</li>
          <li>IPFS integration for metadata</li>
        </ul>
      </div>
    ),
    link: "https://example.com/nft-marketplace"
  },
  {
    id: 3,
    title: "DAO Governance",
    description: "Participate in decentralized governance",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
    badge: { text: "Beta", variant: "outline" },
    content: (
      <div className="space-y-2">
        <p>
          A governance platform for DAOs that enables proposal creation, voting,
          and treasury management with full transparency.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>On-chain voting mechanisms</li>
          <li>Proposal creation and discussion</li>
          <li>Treasury management tools</li>
          <li>Delegation features</li>
        </ul>
      </div>
    ),
    link: "https://example.com/dao-governance"
  }
];