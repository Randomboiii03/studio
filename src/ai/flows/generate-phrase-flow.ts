
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
  prompt: `You are a cybersecurity expert creating content for a typing game.
Generate a single, short, simple phrase (3-5 words) that is a cybersecurity tip. The words should be easy to type.

The phrase must be about one of the following topics. Please choose one topic randomly for each phrase you generate:
- Phishing awareness (e.g., "check email links")
- Strong password practices (e.g., "use a long password")
- Multi-factor authentication (MFA) (e.g., "enable mfa now")
- Data privacy (e.g., "protect your personal data")
- Safe browsing habits (e.g., "avoid public wifi")
- Recognizing malware/ransomware (e.g., "scan files before opening")
- Secure coding practices (e.g., "sanitize your user input")

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


    