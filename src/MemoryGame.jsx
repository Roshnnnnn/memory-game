import React, { useState, useEffect } from "react";

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canFlip, setCanFlip] = useState(true);

  // Generate random Pokemon IDs between 1 and 800
  const generateRandomPokemonIds = () => {
    const ids = new Set();
    while (ids.size < 8) {
      // We need 8 pairs = 16 cards for 4x4 grid
      ids.add(Math.floor(Math.random() * 800) + 1);
    }
    return [...ids];
  };

  // Preload images to prevent flickering
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  // Initialize or reset the game
  const initializeGame = async () => {
    setLoading(true);
    setCanFlip(true);
    const pokemonIds = generateRandomPokemonIds();

    try {
      // Preload all images first
      await Promise.all(
        pokemonIds.map((id) =>
          preloadImage(
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
          )
        )
      );

      const newCards = [...pokemonIds, ...pokemonIds]
        .map((id) => ({
          id,
          isFlipped: false,
          isMatched: false,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        }))
        .sort(() => Math.random() - 0.5);

      setCards(newCards);
      setFlippedCards([]);
      setMatchedPairs([]);
      setAttempts(0);
    } catch (error) {
      console.error("Error loading Pokemon images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check for matches
  const checkForMatch = (firstIndex, secondIndex) => {
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard.id === secondCard.id) {
      // Cards match
      setCards((prevCards) => {
        const newCards = [...prevCards];
        newCards[firstIndex] = { ...newCards[firstIndex], isMatched: true };
        newCards[secondIndex] = { ...newCards[secondIndex], isMatched: true };
        return newCards;
      });
      setMatchedPairs((prev) => [...prev, firstCard.id]);
      setFlippedCards([]);
      setCanFlip(true);
    } else {
      // Cards don't match
      setTimeout(() => {
        setFlippedCards([]);
        setCanFlip(true);
      }, 1000);
    }
  };

  // Handle card click
  const handleCardClick = (index) => {
    if (!canFlip) return;
    if (loading) return;
    if (cards[index].isMatched || flippedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setCanFlip(false);
      setAttempts((prev) => prev + 1);
      checkForMatch(newFlippedCards[0], newFlippedCards[1]);
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-2xl">Loading Pokemon Game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Memory Game</h1>
          <div className="flex gap-6 items-center">
            <p className="text-white text-xl">Moves: {attempts}</p>
            <button
              onClick={initializeGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-[600px] mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              className="aspect-square"
            >
              <div className="w-full h-full relative preserve-3d">
                {/* Front of card (Pokemon) */}
                <div
                  className={`absolute w-full h-full transition-all duration-500 card-front backface-hidden rounded-lg 
                    bg-[#262626] p-2 flex items-center justify-center transform 
                    ${
                      flippedCards.includes(index) || card.isMatched
                        ? "rotate-y-0"
                        : "rotate-y-180"
                    }`}
                >
                  <img
                    src={card.imageUrl}
                    alt="Pokemon"
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                </div>
                {/* Back of card */}
                <div
                  className={`absolute w-full h-full transition-all duration-500 card-back backface-hidden rounded-lg 
                    bg-[#262626] flex items-center justify-center transform
                    ${
                      flippedCards.includes(index) || card.isMatched
                        ? "rotate-y-180"
                        : "rotate-y-0"
                    }`}
                >
                  <div className="w-12 h-12 bg-[#141414] rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matchedPairs.length === 8 && (
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Congratulations! You Won!
            </h2>
            <p className="text-xl text-white mb-4">
              You completed the game in {attempts} moves
            </p>
            <button
              onClick={initializeGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors duration-200"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
