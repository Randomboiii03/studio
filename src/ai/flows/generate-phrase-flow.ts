
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
  words: z.array(z.string()).describe('A short, simple array of words (3-5 words) forming a cybersecurity tip or concept.'),
});
export type GeneratePhraseOutput = z.infer<typeof GeneratePhraseOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePhrasePrompt',
  output: { schema: GeneratePhraseOutputSchema },
  prompt: `You are a cybersecurity expert creating content for a typing game.
Generate a single, short, simple phrase (3-5 words) related to the broad themes of cybersecurity, hacking, or digital defense. The words should be easy to type.
To ensure variety, randomly pick one of the following themes for each phrase you generate:
- Phishing awareness
- Strong password practices
- Multi-factor authentication (MFA)
- Data privacy
- Safe browsing habits
- Recognizing malware/ransomware
- Secure coding practices
- Network security

Make the phrases sound cool and thematic.

Example Phrases for different themes:
- "encrypt the data stream"
- "patch the system vulnerability"
- "defend the network node"
- "bypass the access control"
- "analyze the packet capture"
- "launch the trojan horse"
- "verify the sender email"
- "use a complex password"
- "enable two factor auth"
`,
});

const generatePhraseFlow = ai.defineFlow(
  {
    name: 'generatePhraseFlow',
    outputSchema: GeneratePhraseOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output) {
      return { words: ['secure', 'the', 'system'] };
    }
    // Ensure all words are lowercase
    return {
        words: output.words.join(' ').toLowerCase().split(' ')
    };
  }
);

export async function generatePhrase(): Promise<GeneratePhraseOutput> {
    return generatePhraseFlow();
}
