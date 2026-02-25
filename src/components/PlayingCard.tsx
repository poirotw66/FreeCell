import React from "react";
import { Card as CardType } from "../types";
import { cn } from "../utils/cn";

export interface PlayingCardProps {
  card?: CardType | null;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  placeholder?: string;
}

const SUIT_SYMBOLS = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const RANK_STRINGS: Record<number, string> = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isSelected,
  isSelectable,
  onClick,
  onDoubleClick,
  className,
  placeholder,
}) => {
  if (!card) {
    return (
      <div
        className={cn(
          "w-full aspect-[2/3] rounded md:rounded-lg border-2 border-white/20 bg-black/10 flex items-center justify-center",
          className,
        )}
        onClick={onClick}
      >
        {placeholder && (
          <span className="text-2xl sm:text-4xl opacity-20">{placeholder}</span>
        )}
      </div>
    );
  }

  const isRed = card.color === "red";
  const symbol = SUIT_SYMBOLS[card.suit];
  const rankStr = RANK_STRINGS[card.rank];

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "w-full aspect-[2/3] rounded md:rounded-lg bg-white shadow-sm md:shadow-md border flex flex-col justify-between p-0.5 sm:p-1 md:p-2 select-none transition-transform cursor-pointer",
        isRed
          ? "text-red-600 border-red-200"
          : "text-slate-900 border-slate-200",
        isSelectable && "hover:-translate-y-1",
        isSelected &&
          "ring-2 md:ring-4 ring-blue-400 -translate-y-1 md:-translate-y-2 shadow-lg md:shadow-xl",
        className,
      )}
    >
      <div className="flex flex-col items-center leading-none">
        <span className="text-[10px] sm:text-sm md:text-lg font-bold">
          {rankStr}
        </span>
        <span className="text-[10px] sm:text-sm md:text-xl">{symbol}</span>
      </div>
      <div className="flex flex-col items-center leading-none rotate-180">
        <span className="text-[10px] sm:text-sm md:text-lg font-bold">
          {rankStr}
        </span>
        <span className="text-[10px] sm:text-sm md:text-xl">{symbol}</span>
      </div>
    </div>
  );
};
