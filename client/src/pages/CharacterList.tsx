import { useQuery, useMutation } from "@tanstack/react-query";
import { appRouter } from "@server/routers";
import { Button } from "@client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@client/components/ui/card";
import { Plus, Trash2, Edit, Swords } from "lucide-react";
import { Link } from "wouter";
import { useGameSetting } from "@client/contexts/GameSettingContext";
import { toast } from "sonner";

export function CharacterList() {
  const { currentGame } = useGameSetting();
  const { data: characters, refetch } = useQuery({
    queryKey: ["characters"],
    queryFn: () => appRouter.character.list.query({ setting: currentGame }),
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: appRouter.character.delete.mutate,
    onSuccess: () => {
      toast.success("Character deleted successfully.");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete character.", { description: error.message });
    },
  });

  const handleDelete = (characterId: number) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      deleteCharacterMutation.mutate({ characterId });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Your Characters</h1>
        <Link href="/characters/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create New Character
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Character Roster ({characters?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {characters && characters.length > 0 ? (
            <div className="space-y-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Swords className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-medium text-lg">{char.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {char.birthVector} - {char.faction}
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Link href={`/characters/${char.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(char.id)}
                      disabled={deleteCharacterMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You have no characters yet. Start your journey by creating one!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
