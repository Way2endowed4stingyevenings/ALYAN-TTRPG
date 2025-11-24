import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BookOpen, Dices, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { DiceRoller } from "@client/components/DiceRoller";
import { useGameSetting } from "@client/contexts/GameSettingContext";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { currentGame } = useGameSetting();

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="cosmic-glow text-4xl font-bold mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Hero Section */}
      <div className="container py-12 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center mb-6">
            <img src={APP_LOGO} alt="Conflict Horizon" className="w-32 h-32 rounded-lg shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold cosmic-glow">
            ALYAN TTRPG Hub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Your universal hub for **{currentGame}** and other ALYAN TTRPG systems.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" asChild className="text-lg">
                <a href={getLoginUrl()}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Enter the Tapestry
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" asChild>
                <Link href="/campaigns">
                  <Users className="mr-2 h-5 w-5" />
                  My Campaigns
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/characters">
                  <Sparkles className="mr-2 h-5 w-5" />
                  My Characters
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Universal Tools */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 cosmic-glow">
            Universal Tools for {currentGame}
          </h2>
          <DiceRoller theme={currentGame} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Dungeon Master</CardTitle>
              <CardDescription>
                An intelligent DM that knows the Conflict Horizon lore, runs encounters, and adapts to your choices
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Digital Rulebooks</CardTitle>
              <CardDescription>
                Upload and access your PDFs with full text search and quick reference
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <Users className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Imperial Funnel</CardTitle>
              <CardDescription>
                Create characters using the five-step Imperial Funnel system with full Pentagram attributes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <Dices className="h-10 w-10 text-primary mb-2" />
              <CardTitle>d100 Resolution</CardTitle>
              <CardDescription>
                Built-in dice roller with critical success/failure tracking and Gate system support
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <Zap className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Tarot Psionics</CardTitle>
              <CardDescription>
                Digital Tarot card system for psionic manifestation with automatic Backlash calculation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="psionic-border bg-card/50 backdrop-blur">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Track sessions, manage NPCs, and maintain persistent game state across multiple campaigns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* System Overview */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 cosmic-glow">
            Core Attributes for {currentGame}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/50 backdrop-blur border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">Katra</CardTitle>
                <CardDescription className="text-sm">
                  Air • Physical Action, Agility, Instinct-Driven Movement
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-secondary/50">
              <CardHeader>
                <CardTitle className="text-secondary">Dominion</CardTitle>
                <CardDescription className="text-sm">
                  Earth • Control, Endurance, Resilience, Stability
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-accent/50">
              <CardHeader>
                <CardTitle className="text-accent">Imperius</CardTitle>
                <CardDescription className="text-sm">
                  Fire • Command, Willpower, Aggression, Force of Personality
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">Harmonia</CardTitle>
                <CardDescription className="text-sm">
                  Water • Balance, Empathy, Healing, Emotional Equilibrium
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24 py-8">
        <div className="container text-center text-muted-foreground">
          <p>Powered by the Universal Core • Built for the ALYAN TTRPG Universe</p>
        </div>
      </footer>
    </div>
  );
}
