
'use server';
/**
 * @fileOverview Generates longer, more complex cybersecurity-themed phrases for boss battles.
 *
 * - generateBossPhrase - A function that returns a longer phrase for a boss.
 * - GenerateBossPhraseOutput - The return type for the generateBossPhrase function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBossPhraseOutputSchema = z.object({
  words: z.array(z.string()).describe('A longer, more complex array of words (6-8 words) forming a significant cybersecurity principle.'),
});
export type GenerateBossPhraseOutput = z.infer<typeof GenerateBossPhraseOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateBossPhrasePrompt',
  output: { schema: GenerateBossPhraseOutputSchema },
  prompt: `You are a cybersecurity expert creating challenging content for a typing game's boss battle.
Generate a single, longer, and more complex phrase (6-8 words) that is a significant cybersecurity principle.

The phrase must be about one of the following topics. Please choose one topic randomly for each phrase you generate:
- Phishing awareness (e.g., "always verify sender before you click")
- Strong password practices (e.g., "a long unique password is key")
- Multi-factor authentication (MFA) (e.g., "multi factor authentication protects your accounts")
- Data privacy (e.g., "be mindful of what you share")
- Safe browsing habits (e.g., "think twice before downloading unknown files")
- Recognizing malware/ransomware (e.g., "unexpected popups can indicate serious malware")
- Secure coding practices (e.g., "validate all input to prevent injection")

Example:
- "never reuse your passwords on websites"
- "always check for the https lock"
- "secure your accounts with strong mfa"
`,
});

const generateBossPhraseFlow = ai.defineFlow(
  {
    name: 'generateBossPhraseFlow',
    outputSchema: GenerateBossPhraseOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output) {
      return { words: ['infiltrate', 'the', 'main', 'server', 'and', 'extract', 'data'] };
    }
    // Ensure all words are lowercase
    return {
        words: output.words.map(word => word.toLowerCase())
    };
  }
);

export async function generateBossPhrase(): Promise<GenerateBossPhraseOutput> {
    return generateBossPhraseFlow();
}
