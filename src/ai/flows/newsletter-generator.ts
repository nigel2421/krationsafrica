
'use server';
/**
 * @fileOverview A Genkit flow for generating professional HTML newsletter templates for shoe drops.
 *
 * - generateNewsletterHtml - A function that handles the email HTML generation process.
 * - GenerateNewsletterInput - The input type for the function.
 * - GenerateNewsletterOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNewsletterInputSchema = z.object({
  shoeName: z.string().describe('The name of the shoe product.'),
  imageUrl: z.string().describe('The URL of the shoe image.'),
  price: z.number().describe('The original price.'),
  offerPrice: z.number().optional().describe('The promotional price if applicable.'),
  description: z.string().describe('The product description.'),
  isNewArrival: z.boolean().optional().default(true),
});
export type GenerateNewsletterInput = z.infer<typeof GenerateNewsletterInputSchema>;

const GenerateNewsletterOutputSchema = z.object({
  html: z.string().describe('The full, clean HTML template for the newsletter email.'),
});
export type GenerateNewsletterOutput = z.infer<typeof GenerateNewsletterOutputSchema>;

const newsletterPrompt = ai.definePrompt({
  name: 'newsletterPrompt',
  input: { schema: GenerateNewsletterInputSchema },
  output: { schema: GenerateNewsletterOutputSchema },
  prompt: `You are a luxury email marketing strategist for 'Kreations 254', a premium shoe store in Nairobi.
Your task is to generate a 'clean' and 'professional' HTML email template for a new product announcement or a special offer.

Style Guidelines:
- Use a Deep Indigo (#424266) and Sky Blue (#3AC8F3) color palette.
- The design must be responsive (mobile-friendly).
- Include the brand slogan: "IT WILL ALWAYS LOOK GOOD ON YOU".
- Create a clear, bold "Shop Now" button linking to https://kreations254.com/shop.
- Present the pricing clearly. If there is an offer price, show the original price struck through.
- Use a clean sans-serif font stack (Inter, Arial, sans-serif).

Product Details:
- Name: {{shoeName}}
- Image: {{imageUrl}}
- Description: {{description}}
- Price: KES {{price}}
{{#if offerPrice}}
- Offer Price: KES {{offerPrice}}
{{/if}}

Generate the full <html> structure for this email:`,
});

const generateNewsletterHtmlFlow = ai.defineFlow(
  {
    name: 'generateNewsletterHtmlFlow',
    inputSchema: GenerateNewsletterInputSchema,
    outputSchema: GenerateNewsletterOutputSchema,
  },
  async (input) => {
    const { output } = await newsletterPrompt(input);
    if (!output) throw new Error('Failed to generate newsletter HTML.');
    return output;
  }
);

export async function generateNewsletterHtml(input: GenerateNewsletterInput): Promise<GenerateNewsletterOutput> {
  return generateNewsletterHtmlFlow(input);
}
