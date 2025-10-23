
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
  words: z.array(z.string()).describe('A longer, more complex array of words (6-8 words) forming a significant cybersecurity principle or hacking-related concept.'),
});
export type GenerateBossPhraseOutput = z.infer<typeof GenerateBossPhraseOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateBossPhrasePrompt',
  output: { schema: GenerateBossPhraseOutputSchema },
  prompt: `You are a cybersecurity expert creating challenging content for a typing game's boss battle.
Generate a single, longer, and more complex phrase (6-8 words) related to the broad themes of cybersecurity, hacking, or digital defense.
The phrase should sound cool, thematic, and be a bit of a challenge to type.

Example themes:
- Network infiltration
- Encryption and decryption
- Zero-day exploits
- Advanced persistent threats
- Social engineering
- System vulnerabilities

Example phrases:
- "breach the firewall and access the mainframe"
- "deploy the payload to compromise the system"
- "execute the rootkit and gain full control"
- "initiate zero-day exploit sequence"
- "decrypt the classified government intel"
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
        words: output.words.join(' ').toLowerCase().split(' ')
    };
  }
);

export async function generateBossPhrase(): Promise<GenerateBossPhraseOutput> {
    return generateBossPhraseFlow();
}
