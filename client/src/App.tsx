import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameSettingProvider } from "./contexts/GameSettingContext";
import Home from "./pages/Home";
import { DocumentLibrary } from "./pages/DocumentLibrary";
import { CharacterCreator } from "./pages/CharacterCreator";
import { CharacterList } from "./pages/CharacterList";
import { useGameSetting } from "./contexts/GameSettingContext";
import { GAME_SETTINGS } from "@shared/const";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

function Header() {
  const { currentGame, setGame } = useGameSetting();

  return (
    <header className="p-4 border-b flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary">ALYAN TTRPG Hub</h1>
      <Select value={currentGame} onValueChange={(value) => setGame(value as GameSetting)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Game" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(GAME_SETTINGS).map((setting) => (
            <SelectItem key={setting} value={setting}>
              {setting}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <main className="flex-grow">
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/documents"} component={DocumentLibrary} />
      <Route path={"/characters"} component={CharacterList} />
      <Route path={"/characters/create"} component={CharacterCreator} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <Header />
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <GameSettingProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </main>
        </GameSettingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
