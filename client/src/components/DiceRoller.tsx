import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { appRouter } from "@server/routers";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dice5, Dice6, Dice8, Dice10, Dice12, Dice20 } from "lucide-react";

// Placeholder for the universal card draw mechanic
const CardDrawButton = ({ theme }: { theme: string }) => {
  const [result, setResult] = useState<string | null>(null);
  const handleDraw = () => {
    // Placeholder logic for a card draw mechanic
    const cards = ["The Anchor", "The Void", "The Architect", "The Serpent", "The Fool"];
    const drawnCard = cards[Math.floor(Math.random() * cards.length)];
    setResult(`Drawn Card (${theme}): ${drawnCard}`);
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleDraw} className="w-full" variant="secondary">
        Draw Universal Card ({theme})
      </Button>
      {result && <p className="text-sm text-center text-muted-foreground">{result}</p>}
    </div>
  );
};

// Simple utility to roll a die
const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

// Component for a single die button
const DieButton = ({ sides, icon: Icon }: { sides: number, icon: React.ElementType }) => {
  const [result, setResult] = useState<number | null>(null);
  const handleRoll = () => {
    const roll = rollDie(sides);
    setResult(roll);
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button onClick={handleRoll} size="icon" className="w-12 h-12">
        <Icon className="w-6 h-6" />
      </Button>
      <span className="text-xs font-medium">D{sides}</span>
      {result !== null && <span className="text-lg font-bold text-primary">{result}</span>}
    </div>
  );
};

// Component for the D100 roll-under system
const D100Roller = () => {
  const [target, setTarget] = useState<number>(50);
  const [result, setResult] = useState<{ roll: number, success: boolean } | null>(null);

  const handleRoll = () => {
    const roll = rollDie(100);
    const success = roll <= target;
    setResult({ roll, success });
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-center">D100 Roll-Under</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Target Number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
            className="w-full"
          />
          <Button onClick={handleRoll} className="w-full">
            Roll
          </Button>
        </div>
        {result && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Target: {target}%</p>
            <p className="text-4xl font-extrabold" style={{ color: result.success ? 'var(--color-green)' : 'var(--color-red)' }}>
              {result.roll}
            </p>
            <p className="text-lg font-semibold">
              {result.success ? "SUCCESS" : "FAILURE"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function DiceRoller({ theme }: { theme: string }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Universal Mechanics Hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-6 gap-4">
          <DieButton sides={4} icon={Dice5} />
          <DieButton sides={6} icon={Dice6} />
          <DieButton sides={8} icon={Dice8} />
          <DieButton sides={10} icon={Dice10} />
          <DieButton sides={12} icon={Dice12} />
          <DieButton sides={20} icon={Dice20} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <D100Roller />
          <CardDrawButton theme={theme} />
        </div>
      </CardContent>
    </Card>
  );
}
