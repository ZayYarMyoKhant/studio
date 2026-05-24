'use server';
/**
 * @fileOverview This file implements a Genkit flow for the Smart Item Tool, which suggests quantities and descriptions for list items.
 *
 * - suggestListItemDetails - A function that suggests details for a list item.
 * - SuggestListItemDetailsInput - The input type for the suggestListItemDetails function.
 * - SuggestListItemDetailsOutput - The return type for the suggestListItemDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestListItemDetailsInputSchema = z.object({
  itemName: z
    .string()
    .describe('The name of the item for which details are being suggested.'),
  listContext: z
    .string()
    .describe(
      'The context or type of the list the item is being added to (e.g., "grocery list", "packing list for camping", "shopping list for new apartment").'
    ),
});
export type SuggestListItemDetailsInput = z.infer<
  typeof SuggestListItemDetailsInputSchema
>;

const SuggestListItemDetailsOutputSchema = z.object({
  suggestedQuantity: z
    .string()
    .describe(
      'A suggested quantity for the item, considering the list context. This can be a number, a unit, or a phrase (e.g., "6", "1 gallon", "a few").'
    ),
  description: z
    .string()
    .describe(
      'A brief, context-aware description for the item, explaining its potential use or why it might be needed in this list.'
    ),
});
export type SuggestListItemDetailsOutput = z.infer<
  typeof SuggestListItemDetailsOutputSchema
>;

export async function suggestListItemDetails(
  input: SuggestListItemDetailsInput
): Promise<SuggestListItemDetailsOutput> {
  return suggestListItemDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestListItemDetailsPrompt',
  input: { schema: SuggestListItemDetailsInputSchema },
  output: { schema: SuggestListItemDetailsOutputSchema },
  prompt: `You are a smart item assistant for a list-making application called SarinEase. Your task is to suggest a suitable quantity and provide a brief, context-aware description for an item based on the list's purpose.

Consider the following:
Item Name: {{{itemName}}}
List Context: {{{listContext}}}

Based on this, what would be a reasonable quantity and a useful description?`,
});

const suggestListItemDetailsFlow = ai.defineFlow(
  {
    name: 'suggestListItemDetailsFlow',
    inputSchema: SuggestListItemDetailsInputSchema,
    outputSchema: SuggestListItemDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
