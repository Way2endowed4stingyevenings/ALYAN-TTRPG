import React, { createContext, useContext, useState, useMemo } from "react";
import { GameSetting, GAME_SETTINGS } from "@shared/const";

interface GameSettingContextType {
  currentGame: GameSetting;
  setGame: (setting: GameSetting) => void;
}

const GameSettingContext = createContext<GameSettingContextType | undefined>(undefined);

export const GameSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Conflict Horizon
  const [currentGame, setCurrentGame] = useState<GameSetting>(GAME_SETTINGS.CONFLICT_HORIZON);

  const setGame = (setting: GameSetting) => {
    setCurrentGame(setting);
  };

  const value = useMemo(() => ({
    currentGame,
    setGame,
  }), [currentGame]);

  return (
    <GameSettingContext.Provider value={value}>
      {children}
    </GameSettingContext.Provider>
  );
};

export const useGameSetting = () => {
  const context = useContext(GameSettingContext);
  if (context === undefined) {
    throw new Error("useGameSetting must be used within a GameSettingProvider");
  }
  return context;
};
