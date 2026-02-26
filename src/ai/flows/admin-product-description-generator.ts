'use server';
/**
 * @fileOverview A Genkit flow for generating engaging product descriptions for shoes.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  shoeName: z.string().describe('The name of the shoe product.'),
  category: z.string().describe('The category of the shoe (e.g., Sneakers, Boots, Casual, Official).'),
  keyFeatures: z.array(z.string()).describe('A list of key features or selling points for the shoe.').optional(),
  material: z.string().describe('The primary material of the shoe (e.g., leather, knit fabric, synthetic).').optional(),
  occasion: z.string().describe('The intended occasion or use for the shoe (e.g., casual wear, running, formal events).').optional(),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated engaging product description for the shoe.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return adminProductDescriptionGeneratorFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert copywriter for 'Kreations Kicks', a modern shoe store. Your task is to craft a concise, engaging, and persuasive product description for a shoe.

Highlight the unique selling points and appeal to the target audience. Keep the description under 150 words.

Product Details:
- Name: {{{shoeName}}}
- Category: {{{category}}}
{{#if material}}
- Material: {{{material}}}
{{/if}}
{{#if occasion}}
- Occasion: {{{occasion}}}
{{/if}}
{{#if keyFeatures}}
- Key Features: {{#each keyFeatures}}- {{{this}}}{{/each}}
{{/if}}

Generate an engaging product description:`,
});

const adminProductDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'adminProductDescriptionGeneratorFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await productDescriptionPrompt(input);
    return output!;
  }
);
