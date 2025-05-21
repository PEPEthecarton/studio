
import { config } from 'dotenv';
config();

import '@/ai/flows/diagnose-illness.ts'; // General diagnosis
import '@/ai/flows/diagnose-sti.ts';     // STI diagnosis
import '@/ai/flows/generate-illness-image.ts'; // General image
import '@/ai/flows/generate-sti-image.ts';     // STI image
