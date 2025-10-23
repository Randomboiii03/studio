
'use server';
/**
 * @fileOverview Generates cybersecurity-themed phrases for the game.
 *
 * - generatePhrase - A function that returns a short phrase.
 * - GeneratePhraseOutput - The return type for the generatePhrase function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePhraseOutputSchema = z.object({
  words: z.array(z.string()).describe('A short, simple array of words (3-5 words) forming a cybersecurity tip.'),
});
export type GeneratePhraseOutput = z.infer<typeof GeneratePhraseOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePhrasePrompt',
  output: { schema: GeneratePhraseOutputSchema },
  prompt: `You are a cybersecurity expert creating content for a typing game. Generate a single, short, simple phrase (3-5 words) that is a cybersecurity tip. The words should be easy to type.

Example:
- "update your passwords now"
- "be careful with public wifi"
- "never share your login"
`,
});

const generatePhraseFlow = ai.defineFlow(
  {
    name: 'generatePhraseFlow',
    outputSchema: GeneratePhraseOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);

export async function generatePhrase(): Promise<GeneratePhraseOutput> {
    return generatePhraseFlow();
}
