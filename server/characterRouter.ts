import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { characters, InsertCharacter } from "../drizzle/schema";
import { GameSetting, GAME_SETTINGS } from "../shared/const";
import { eq } from "drizzle-orm";

// Define the schema for character creation input
const createCharacterSchema = z.object({
  setting: z.nativeEnum(GAME_SETTINGS).default(GAME_SETTINGS.CONFLICT_HORIZON),
  name: z.string().min(1, "Character name is required"),
  campaignId: z.number().int().optional(), // Optional if not tied to a campaign yet

  // Imperial Funnel data
  birthVector: z.string().optional(),
  pointOfOrigin: z.string().optional(),
  faction: z.string().optional(),
  edict: z.string().optional(),

  // Pentagram Attributes
  katra: z.number().int().min(1).max(20).default(10),
  dominion: z.number().int().min(1).max(20).default(10),
  imperius: z.number().int().min(1).max(20).default(10),
  harmonia: z.number().int().min(1).max(20).default(10),

  // Alignment
  gnosis: z.number().int().min(-100).max(100).default(0),
  entropy: z.number().int().min(-100).max(100).default(0),

  // Additional data (Proficiencies and Equipment will be JSON strings)
  proficiencies: z.string().optional(),
  equipment: z.string().optional(),
  notes: z.string().optional(),
});

export const characterRouter = router({
  // 1. Create a new character
  create: protectedProcedure
    .input(createCharacterSchema)
    .mutation(async ({ ctx, input }) => {
      const characterData: InsertCharacter = {
        userId: ctx.user.id,
        setting: input.setting,
        ...input,
        // Ensure proficiencies and equipment are stored as strings (JSON.stringify will be done on client)
        proficiencies: input.proficiencies,
        equipment: input.equipment,
      };

      const [newCharacter] = await db
        .insert(characters)
        .values(characterData)
        .returning();

      return newCharacter;
    }),

  // 2. Get a single character by ID
  getById: protectedProcedure
    .input(z.object({ characterId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [character] = await db
        .select()
        .from(characters)
        .where(eq(characters.id, input.characterId));

      if (!character || character.userId !== ctx.user.id) {
        throw new Error("Character not found or access denied");
      }

      return character;
    }),

  // 3. List all characters for the current user
  list: protectedProcedure
    .input(z.object({ setting: z.nativeEnum(GAME_SETTINGS).default(GAME_SETTINGS.CONFLICT_HORIZON) }))
    .query(async ({ ctx, input }) => {
      return db
        .select()
        .from(characters)
        .where(and(eq(characters.userId, ctx.user.id), eq(characters.setting, input.setting)));
    }),

  // 4. Delete a character
  delete: protectedProcedure
    .input(z.object({ characterId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .delete(characters)
        .where(eq(characters.id, input.characterId))
        .returning();

      if (result.length === 0) {
        throw new Error("Character not found or access denied");
      }

      return { success: true };
    }),
});
