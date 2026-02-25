import React, { useState, useEffect } from "react";
import { GameState, Position, Card, Suit } from "./types";
import { dealGame, SUITS } from "./utils/deck";
import {
  canMove,
  executeMove,
  getSafeFoundationMoves,
  checkWin,
  isValidSequence,
} from "./utils/gameLogic";
import { PlayingCard } from "./components/PlayingCard";
import { Undo2, RotateCcw, Settings } from "lucide-react";

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const { tableaus } = dealGame();
    return {
      freeCells: [null, null, null, null],
      foundations: { spades: 0, hearts: 0, diamonds: 0, clubs: 0 },
      tableaus,
      history: [],
    };
  });

  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [autoMove, setAutoMove] = useState(true);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    if (checkWin(gameState)) {
      setHasWon(true);
    } else {
      setHasWon(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!autoMove || hasWon) return;
    const safeMove = getSafeFoundationMoves(gameState);
    if (safeMove && !selectedPos) {
      const timer = setTimeout(() => {
        handleMove(safeMove.source, safeMove.dest);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [gameState, selectedPos, autoMove, hasWon]);

  const handleMove = (source: Position, dest: Position) => {
    setGameState((prev) => {
      const nextState = executeMove(prev, source, dest);
      return {
        ...nextState,
        history: [...prev.history, prev],
      };
    });
  };

  const undo = () => {
    setGameState((prev) => {
      if (prev.history.length === 0) return prev;
      const prevState = prev.history[prev.history.length - 1];
      return {
        ...prevState,
        history: prev.history.slice(0, -1),
      };
    });
    setSelectedPos(null);
  };

  const startNewGame = () => {
    const { tableaus } = dealGame();
    setGameState({
      freeCells: [null, null, null, null],
      foundations: { spades: 0, hearts: 0, diamonds: 0, clubs: 0 },
      tableaus,
      history: [],
    });
    setSelectedPos(null);
    setHasWon(false);
  };

  const handleCardClick = (pos: Position, hasCard: boolean) => {
    if (hasWon) return;

    if (selectedPos) {
      if (
        selectedPos.zone === pos.zone &&
        selectedPos.index === pos.index &&
        selectedPos.cardIndex === pos.cardIndex
      ) {
        setSelectedPos(null);
        return;
      }

      if (pos.zone === "foundation") {
        if (canMove(gameState, selectedPos, pos)) {
          handleMove(selectedPos, pos);
          setSelectedPos(null);
          return;
        }
      }

      if (pos.zone === "freeCell" && !hasCard) {
        if (canMove(gameState, selectedPos, pos)) {
          handleMove(selectedPos, pos);
          setSelectedPos(null);
          return;
        }
      }

      if (pos.zone === "tableau") {
        const col = gameState.tableaus[pos.index];
        const isBottomOrEmpty = !hasCard || pos.cardIndex === col.length - 1;

        if (isBottomOrEmpty && canMove(gameState, selectedPos, pos)) {
          handleMove(selectedPos, pos);
          setSelectedPos(null);
          return;
        }
      }
    }

    if (hasCard && pos.zone !== "foundation") {
      if (pos.zone === "tableau") {
        const col = gameState.tableaus[pos.index];
        const cardsToMove = col.slice(pos.cardIndex);
        if (isValidSequence(cardsToMove)) {
          setSelectedPos(pos);
        }
      } else {
        setSelectedPos(pos);
      }
    } else {
      setSelectedPos(null);
    }
  };

  const handleDoubleClick = (pos: Position) => {
    if (hasWon) return;

    if (canMove(gameState, pos, { zone: "foundation", index: 0 })) {
      handleMove(pos, { zone: "foundation", index: 0 });
      setSelectedPos(null);
      return;
    }

    const emptyFreeCellIndex = gameState.freeCells.findIndex((c) => c === null);
    if (emptyFreeCellIndex !== -1) {
      if (
        canMove(gameState, pos, { zone: "freeCell", index: emptyFreeCellIndex })
      ) {
        handleMove(pos, { zone: "freeCell", index: emptyFreeCellIndex });
        setSelectedPos(null);
        return;
      }
    }
  };

  return (
    <div className="min-h-screen bg-emerald-800 text-white p-2 sm:p-4 md:p-8 font-sans select-none">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            FreeCell
          </h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <label className="hidden sm:flex items-center gap-2 text-sm cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                checked={autoMove}
                onChange={(e) => setAutoMove(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Auto-move
            </label>
            <button
              onClick={undo}
              disabled={gameState.history.length === 0}
              className="p-2 sm:px-4 sm:py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center gap-2"
              title="Undo"
            >
              <Undo2 size={18} />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              onClick={startNewGame}
              className="p-2 sm:px-4 sm:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
              title="New Game"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline">New Game</span>
            </button>
          </div>
        </div>

        {hasWon && (
          <div className="mb-8 p-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
            <h2 className="text-3xl font-bold text-yellow-300 mb-2">
              You Won!
            </h2>
            <p className="text-yellow-100 mb-4">
              Congratulations on solving this game.
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2 bg-yellow-500 text-yellow-950 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Top Row: Free Cells & Foundations */}
        <div className="flex justify-between mb-8">
          {/* Free Cells */}
          <div className="flex gap-1 sm:gap-2 md:gap-4 w-[48%]">
            {gameState.freeCells.map((card, i) => (
              <div key={`fc-${i}`} className="flex-1">
                <PlayingCard
                  card={card}
                  isSelected={
                    selectedPos?.zone === "freeCell" && selectedPos.index === i
                  }
                  isSelectable={!!card}
                  onClick={() =>
                    handleCardClick({ zone: "freeCell", index: i }, !!card)
                  }
                  onDoubleClick={() =>
                    card && handleDoubleClick({ zone: "freeCell", index: i })
                  }
                />
              </div>
            ))}
          </div>

          {/* Foundations */}
          <div className="flex gap-1 sm:gap-2 md:gap-4 w-[48%] justify-end">
            {SUITS.map((suit, i) => {
              const rank = gameState.foundations[suit];
              const card =
                rank > 0
                  ? ({
                      id: `f-${suit}-${rank}`,
                      suit,
                      rank,
                      color:
                        suit === "hearts" || suit === "diamonds"
                          ? "red"
                          : "black",
                    } as Card)
                  : null;

              const suitSymbols = {
                spades: "♠",
                hearts: "♥",
                diamonds: "♦",
                clubs: "♣",
              };

              return (
                <div key={`fd-${suit}`} className="flex-1">
                  <PlayingCard
                    card={card}
                    placeholder={suitSymbols[suit]}
                    onClick={() =>
                      handleCardClick({ zone: "foundation", index: i }, false)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableaus */}
        <div className="grid grid-cols-8 gap-1 sm:gap-2 md:gap-4">
          {gameState.tableaus.map((col, colIndex) => (
            <div key={`tab-${colIndex}`} className="flex flex-col">
              {col.length === 0 ? (
                <PlayingCard
                  card={null}
                  onClick={() =>
                    handleCardClick(
                      { zone: "tableau", index: colIndex, cardIndex: 0 },
                      false,
                    )
                  }
                />
              ) : (
                col.map((card, cardIndex) => {
                  const isSelected =
                    selectedPos?.zone === "tableau" &&
                    selectedPos.index === colIndex &&
                    cardIndex >= selectedPos.cardIndex!;

                  // Check if this card is part of a valid sequence from here to the bottom
                  const isSelectable = isValidSequence(col.slice(cardIndex));

                  return (
                    <div
                      key={card.id}
                      className={
                        cardIndex > 0 ? "-mt-[110%] relative" : "relative"
                      }
                      style={{ zIndex: cardIndex }}
                    >
                      <PlayingCard
                        card={card}
                        isSelected={isSelected}
                        isSelectable={isSelectable}
                        onClick={() =>
                          handleCardClick(
                            { zone: "tableau", index: colIndex, cardIndex },
                            true,
                          )
                        }
                        onDoubleClick={() =>
                          handleDoubleClick({
                            zone: "tableau",
                            index: colIndex,
                            cardIndex,
                          })
                        }
                      />
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
