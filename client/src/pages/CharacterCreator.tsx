import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGameSetting } from "@client/contexts/GameSettingContext";
import { GAME_SETTINGS, GameSetting } from "@shared/const";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@client/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@client/components/ui/form";
import { Input } from "@client/components/ui/input";
import { toast } from "sonner";
import { appRouter } from "@server/routers";
import { useMutation } from "@tanstack/react-query";

// --- Schemas and Types ---

const imperialFunnelSchema = z.object({
  birthVector: z.string().min(1, "Birth Vector is required"),
  pointOfOrigin: z.string().min(1, "Point of Origin is required"),
  faction: z.string().min(1, "Faction is required"),
  edict: z.string().min(1, "Edict is required"),
});

const attributesSchema = z.object({
  katra: z.number().int().min(1).max(20),
  dominion: z.number().int().min(1).max(20),
  imperius: z.number().int().min(1).max(20),
  harmonia: z.number().int().min(1).max(20),
});

const alignmentSchema = z.object({
  gnosis: z.number().int().min(-100).max(100),
  entropy: z.number().int().min(-100).max(100),
});

const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  campaignId: z.number().int().optional(),
  setting: z.nativeEnum(GAME_SETTINGS),
});

const characterCreationSchema = baseCharacterSchema
  .merge(imperialFunnelSchema)
  .merge(attributesSchema)
  .merge(alignmentSchema)
  .extend({
    proficiencies: z.string().optional(),
    equipment: z.string().optional(),
    notes: z.string().optional(),
  });

type CharacterCreationFormValues = z.infer<typeof characterCreationSchema>;

// --- Components ---

const ImperialFunnelStep = ({ form }: { form: any }) => (
  <CardContent className="space-y-4">
    <h3 className="text-xl font-semibold">Imperial Funnel</h3>
    <FormField
      control={form.control}
      name="birthVector"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Birth Vector</FormLabel>
          <FormControl>
            <Input placeholder="e.g., Void-Born, Terra-Native" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="pointOfOrigin"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Point of Origin</FormLabel>
          <FormControl>
            <Input placeholder="e.g., Mars, The Belt" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="faction"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Faction</FormLabel>
          <FormControl>
            <Input placeholder="e.g., Mechanicum, Ecclesiarchy" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="edict"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Edict</FormLabel>
          <FormControl>
            <Input placeholder="e.g., Inquisitor, Rogue Trader" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </CardContent>
);

// import { Slider } from "@client/components/ui/slider"; // Removed as it's now imported inside the component where needed



const AttributePairSlider = ({ form, name1, label1, name2, label2, totalPoints }: { form: any, name1: string, label1: string, name2: string, label2: string, totalPoints: number }) => {
  const value1 = form.watch(name1);
  const value2 = form.watch(name2);

  const handleSliderChange = (newValue: number[], fieldName: string) => {
    const newTotal = newValue[0];
    const otherName = fieldName === name1 ? name2 : name1;
    const otherValue = totalPoints - newTotal;

    if (otherValue >= 1 && otherValue <= 20) {
      form.setValue(fieldName, newTotal, { shouldValidate: true });
      form.setValue(otherName, otherValue, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <h4 className="font-bold text-lg">Opposed Pair: {label1} vs {label2} (Total: {totalPoints})</h4>
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={name1}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="capitalize">{label1}</FormLabel>
                <span className="font-bold text-xl text-primary">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  min={1}
                  max={totalPoints - 1} // Max value is totalPoints - 1 to ensure the other attribute is at least 1
                  step={1}
                  value={[field.value]}
                  onValueChange={(val) => handleSliderChange(val, name1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={name2}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="capitalize">{label2}</FormLabel>
                <span className="font-bold text-xl text-primary">{field.value}</span>
              </div>
              <FormControl>
                <Slider
                  min={1}
                  max={totalPoints - 1}
                  step={1}
                  value={[field.value]}
                  onValueChange={(val) => handleSliderChange(val, name2)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const AttributesStep = ({ form, currentGame }: { form: any, currentGame: GameSetting }) => {
  const attributeData = (() => {
    // The logic here is simplified because the game data is now structured to support the universal keys.
    // We can use the universal keys and load the game-specific names from the JSON data.
    // However, for now, we will keep the explicit switch to control the UI logic (opposed vs. single).
    const gameData = GAME_DATA[currentGame];

    switch (currentGame) {
      case GAME_SETTINGS.HARROWING_TRUTH:
        return {
          title: gameData.settingName + " Core Attributes",
          description: "Allocate points to your six core attributes (30% to 90%).",
          pairs: [
            { name1: "katra", label1: gameData.attributes.find(a => a.universalKey === 'katra')?.name || 'Katra', name2: "dominion", label2: gameData.attributes.find(a => a.universalKey === 'dominion')?.name || 'Dominion' },
            { name1: "imperius", label1: gameData.attributes.find(a => a.universalKey === 'imperius')?.name || 'Imperius', name2: "harmonia", label2: gameData.attributes.find(a => a.universalKey === 'harmonia')?.name || 'Harmonia' },
            { name1: "gnosis", label1: gameData.attributes.find(a => a.universalKey === 'gnosis')?.name || 'Gnosis', name2: "entropy", label2: gameData.attributes.find(a => a.universalKey === 'entropy')?.name || 'Entropy' },
          ],
          isOpposed: false,
          min: 30,
          max: 90,
        };
      case GAME_SETTINGS.PLANET_OF_THE_SONG:
        return {
          title: gameData.settingName + " Core Attributes",
          description: "Set your four core attributes (Force, Arcanum, Essence, Prowess) using the opposed point-buy system.",
          pairs: [
            { name1: "katra", label1: gameData.attributes.find(a => a.universalKey === 'katra')?.name || 'Katra', name2: "imperius", label2: gameData.attributes.find(a => a.universalKey === 'imperius')?.name || 'Imperius' },
            { name1: "dominion", label1: gameData.attributes.find(a => a.universalKey === 'dominion')?.name || 'Dominion', name2: "harmonia", label2: gameData.attributes.find(a => a.universalKey === 'harmonia')?.name || 'Harmonia' },
          ],
          isOpposed: true,
          totalPoints: 20,
        };
      case GAME_SETTINGS.CONFLICT_HORIZON:
      default:
        return {
          title: gameData.settingName + " Pentagram Attributes",
          description: "The system enforces an antagonistic relationship: increasing one attribute reduces its opposite.",
          pairs: [
            { name1: "katra", label1: gameData.attributes.find(a => a.universalKey === 'katra')?.name || 'Katra', name2: "imperius", label2: gameData.attributes.find(a => a.universalKey === 'imperius')?.name || 'Imperius' },
            { name1: "dominion", label1: gameData.attributes.find(a => a.universalKey === 'dominion')?.name || 'Dominion', name2: "harmonia", label2: gameData.attributes.find(a => a.universalKey === 'harmonia')?.name || 'Harmonia' },
          ],
          isOpposed: true,
          totalPoints: 20,
        };
    }
  })();

        return {
          title: "Core Attributes (D100)",
          description: "Allocate points to your six core attributes (30% to 90%).",
          pairs: [
            { name1: "katra", label1: "Strength (STR)", name2: "dominion", label2: "Dexterity (DEX)" },
            { name1: "imperius", label1: "Constitution (CON)", name2: "harmonia", label2: "Intelligence (INT)" },
            { name1: "gnosis", label1: "Sanity (SAN)", name2: "entropy", label2: "Charisma (CHA)" },
          ],
          isOpposed: false,
          min: 30,
          max: 90,
        };
      case GAME_SETTINGS.PLANET_OF_THE_SONG:
        return {
          title: "Core Attributes (Planet of the Song)",
          description: "Set your four core attributes (Force, Arcanum, Essence, Prowess).",
          pairs: [
            { name1: "katra", label1: gameData.attributes.find(a => a.universalKey === 'katra')?.name || 'Katra', name2: "imperius", label2: gameData.attributes.find(a => a.universalKey === 'imperius')?.name || 'Imperius' },
            { name1: "dominion", label1: gameData.attributes.find(a => a.universalKey === 'dominion')?.name || 'Dominion', name2: "harmonia", label2: gameData.attributes.find(a => a.universalKey === 'harmonia')?.name || 'Harmonia' },
          ],
          isOpposed: true,
          totalPoints: 20,
        };
      case GAME_SETTINGS.CONFLICT_HORIZON:
      default:
        return {
          title: "Pentagram Attributes (Opposed Pairs)",
          description: "The system enforces an antagonistic relationship: increasing one attribute reduces its opposite.",
          pairs: [
            { name1: "katra", label1: gameData.attributes.find(a => a.universalKey === 'katra')?.name || 'Katra', name2: "imperius", label2: gameData.attributes.find(a => a.universalKey === 'imperius')?.name || 'Imperius' },
            { name1: "dominion", label1: gameData.attributes.find(a => a.universalKey === 'dominion')?.name || 'Dominion', name2: "harmonia", label2: gameData.attributes.find(a => a.universalKey === 'harmonia')?.name || 'Harmonia' },
          ],
          isOpposed: true,
          totalPoints: 20,
        };
    }
  })();

  // Component for a single, non-opposed attribute (for Harrowing Truth)
  const SingleAttributeSlider = ({ form, name, label, min, max }: { form: any, name: string, label: string, min: number, max: number }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel className="capitalize">{label}</FormLabel>
            <span className="font-bold text-xl text-primary">{field.value}%</span>
          </div>
          <FormControl>
            <Slider
              min={min}
              max={max}
              step={1}
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Component for opposed attribute pairs (for Conflict Horizon and Planet of the Song)
  const OpposedAttributePairSlider = ({ form, name1, label1, name2, label2, totalPoints }: { form: any, name1: string, label1: string, name2: string, label2: string, totalPoints: number }) => {
    const value1 = form.watch(name1);
    const value2 = form.watch(name2);

    const handleSliderChange = (newValue: number[], fieldName: string) => {
      const newTotal = newValue[0];
      const otherName = fieldName === name1 ? name2 : name1;
      const otherValue = totalPoints - newTotal;

      if (otherValue >= 1 && otherValue <= totalPoints - 1) {
        form.setValue(fieldName, newTotal, { shouldValidate: true });
        form.setValue(otherName, otherValue, { shouldValidate: true });
      }
    };

    return (
      <div className="space-y-4 border p-4 rounded-lg">
        <h4 className="font-bold text-lg">Opposed Pair: {label1} vs {label2} (Total: {totalPoints})</h4>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={name1}
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="capitalize">{label1}</FormLabel>
                  <span className="font-bold text-xl text-primary">{field.value}</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={totalPoints - 1} // Max value is totalPoints - 1 to ensure the other attribute is at least 1
                    step={1}
                    value={[field.value]}
                    onValueChange={(val) => handleSliderChange(val, name1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={name2}
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="capitalize">{label2}</FormLabel>
                  <span className="font-bold text-xl text-primary">{field.value}</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={totalPoints - 1}
                    step={1}
                    value={[field.value]}
                    onValueChange={(val) => handleSliderChange(val, name2)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <CardContent className="space-y-6">
      <h3 className="text-xl font-semibold">{attributeData.title}</h3>
      <p className="text-sm text-muted-foreground">
        {attributeData.description}
      </p>
      {attributeData.isOpposed ? (
        <>
          {attributeData.pairs.map((pair, index) => (
            <OpposedAttributePairSlider
              key={index}
              form={form}
              name1={pair.name1}
              label1={pair.label1}
              name2={pair.name2}
              label2={pair.label2}
              totalPoints={attributeData.totalPoints!}
            />
          ))}
        </>
      ) : (
        <>
          {/* Render all six attributes for Harrowing Truth as single sliders */}
          <SingleAttributeSlider form={form} name="katra" label="Strength (STR)" min={attributeData.min!} max={attributeData.max!} />
          <SingleAttributeSlider form={form} name="dominion" label="Dexterity (DEX)" min={attributeData.min!} max={attributeData.max!} />
          <SingleAttributeSlider form={form} name="imperius" label="Constitution (CON)" min={attributeData.min!} max={attributeData.max!} />
          <SingleAttributeSlider form={form} name="harmonia" label="Intelligence (INT)" min={attributeData.min!} max={attributeData.max!} />
          <SingleAttributeSlider form={form} name="gnosis" label="Sanity (SAN)" min={attributeData.min!} max={attributeData.max!} />
          <SingleAttributeSlider form={form} name="entropy" label="Charisma (CHA)" min={attributeData.min!} max={attributeData.max!} />
        </>
      )}
    </CardContent>
  );
};
  // Assuming a starting total of 20 for each opposed pair (10 + 10 default)
  const totalPoints = 20;

  return (
    <CardContent className="space-y-6">
      <h3 className="text-xl font-semibold">Pentagram Attributes (Opposed Pairs)</h3>
      <p className="text-sm text-muted-foreground">
        The system enforces an antagonistic relationship: increasing one attribute reduces its opposite.
      </p>
      <AttributePairSlider
        form={form}
        name1="katra"
        label1="Katra (Physical)"
        name2="imperius"
        label2="Imperius (Will/Social)"
        totalPoints={totalPoints}
      />
      <AttributePairSlider
        form={form}
        name1="dominion"
        label1="Dominion (Endurance)"
        name2="harmonia"
        label2="Harmonia (Empathy/Psionic)"
        totalPoints={totalPoints}
      />
    </CardContent>
  );
};

import { Slider } from "@client/components/ui/slider";

const ProficienciesStep = ({ form, currentGame }: { form: any, currentGame: GameSetting }) => (
  <CardContent className="space-y-6">
    <h3 className="text-xl font-semibold">Proficiencies and Gate Tier System</h3>
    <p className="text-sm text-muted-foreground">
      The Edict chosen in the Imperial Funnel will determine your initial Proficiency package.
      You can spend remaining points here.
    </p>
    {/* Placeholder for a complex Proficiency/Gate UI */}
    <div className="border p-4 rounded-lg">
      <h4 className="font-bold text-lg mb-2">Proficiency List (JSON/Text Area for now)</h4>
      <FormField
        control={form.control}
        name="proficiencies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proficiencies (JSON or comma-separated list)</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder='{"name": "Melee Combat", "tier": "Adept", "gate": "Katra"}'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Character Notes</FormLabel>
          <FormControl>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional notes about your character..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </CardContent>
);

const AlignmentStep = ({ form, currentGame }: { form: any, currentGame: GameSetting }) => {
  if (currentGame !== GAME_SETTINGS.CONFLICT_HORIZON) {
    return (
      <CardContent>
        <h3 className="text-xl font-semibold">Alignment/Unique Mechanic</h3>
        <p className="text-sm text-muted-foreground">
          {currentGame} uses a different alignment system (e.g., Sanity for Harrowing Truth, Resonance/Dissonance for Planet of the Song).
          This step is skipped for now, but the data is captured in the Attributes step.
        </p>
      </CardContent>
    );
  }
  const gnosis = form.watch("gnosis");
  const entropy = form.watch("entropy");

  // The alignment is a single axis from -100 (pure Entropy) to +100 (pure Gnosis)
  // The schema has separate fields, so we'll use one to drive the other for now.
  // Assuming Gnosis is the primary value, and Entropy is its inverse.
  // The user will set a single value, and the other will be derived.
  // For simplicity, we'll use a single slider for the Gnosis/Entropy score.
  // The schema fields will be updated based on this single score.

  const handleAlignmentChange = (newValue: number[]) => {
    const score = newValue[0];
    form.setValue("gnosis", score, { shouldValidate: true });
    form.setValue("entropy", -score, { shouldValidate: true }); // Inverse relationship
  };

  return (
    <CardContent className="space-y-6">
      <h3 className="text-xl font-semibold">Gnosis/Entropy Alignment</h3>
      <p className="text-sm text-muted-foreground">
        Defines your disposition toward Order (Gnosis) or Chaos (Entropy).
      </p>
      <FormField
        control={form.control}
        name="gnosis"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Alignment Score</FormLabel>
              <span className="font-bold text-xl text-primary">
                {field.value > 0 ? `+${field.value} Gnosis` : field.value < 0 ? `${field.value} Entropy` : "Neutral"}
              </span>
            </div>
            <FormControl>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[field.value]}
                onValueChange={handleAlignmentChange}
              />
            </FormControl>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>-100 Entropy (Chaos)</span>
              <span>+100 Gnosis (Order)</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Hidden field to keep Entropy in sync with the schema */}
      <FormField
        control={form.control}
        name="entropy"
        render={({ field }) => <Input type="hidden" {...field} />}
      />
    </CardContent>
  );
};

const proficienciesSchema = z.object({
  proficiencies: z.string().optional(), // Will be JSON stringified on submit
  notes: z.string().optional(),
});

const steps = [
  { id: 1, title: "Imperial Funnel", component: ImperialFunnelStep, schema: imperialFunnelSchema },
  { id: 2, title: "Attributes", component: AttributesStep, schema: attributesSchema },
  { id: 3, title: "Alignment", component: AlignmentStep, schema: alignmentSchema },
  { id: 4, title: "Proficiencies & Notes", component: ProficienciesStep, schema: proficienciesSchema },
];

export function CharacterCreator() {
  const { currentGame } = useGameSetting();
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<CharacterCreationFormValues>({
    resolver: zodResolver(characterCreationSchema),
    defaultValues: {
      name: "",
      setting: currentGame,
      birthVector: "",
      pointOfOrigin: "",
      faction: "",
      edict: "",
      katra: 10,
      dominion: 10,
      imperius: 10,
      harmonia: 10,
      gnosis: 0,
      entropy: 0,
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: appRouter.character.create.mutate,
    onSuccess: (data) => {
      toast.success(\`Character "\${data.name}" created successfully!\`);
      // TODO: Navigate to character sheet page
    },
    onError: (error) => {
      toast.error("Character creation failed.", { description: error.message });
    },
  });

  const onSubmit = (data: CharacterCreationFormValues) => {
    // Final submission logic
    createCharacterMutation.mutate(data);
  };

  const handleNext = async () => {
    // Validate only the fields for the current step
    const currentSchema = steps[currentStep].schema;
    const fieldsToValidate = Object.keys(currentSchema.shape);
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step, submit the form
        form.handleSubmit(onSubmit)();
      }
    } else {
      toast.error("Please complete the required fields for this step.");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Pass currentGame to the step component
  const StepComponent = CurrentStepComponent;

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Character</CardTitle>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold">Character Identity</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter character name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}

            <StepComponent form={form} currentGame={currentGame} />

            <CardContent className="flex justify-between pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={createCharacterMutation.isPending}
              >
                {currentStep < steps.length - 1 ? "Next" : "Create Character"}
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
