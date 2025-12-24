"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const LoaderOne = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary" />
    </div>
  );
};

export const LoaderTwo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative h-10 w-10", className)}>
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
};

export const LoaderThree = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex space-x-2", className)}>
      <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
      <div className="h-3 w-3 animate-pulse rounded-full bg-primary/80 [animation-delay:0.2s]" />
      <div className="h-3 w-3 animate-pulse rounded-full bg-primary/60 [animation-delay:0.4s]" />
    </div>
  );
};

export const LoaderFour = ({ text = "Loading...", className }: { text?: string; className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="text-sm text-muted-foreground animate-pulse">{text}</span>
    </div>
  );
};

export const LoaderFive = ({ text = "Loading", className }: { text?: string; className?: string }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
      <span className="ml-1 animate-pulse">.</span>
      <span className="animate-pulse [animation-delay:0.2s]">.</span>
      <span className="animate-pulse [animation-delay:0.4s]">.</span>
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-5/6" />
    </div>
  );
};

// Spinner loader
export const Spinner = ({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
};