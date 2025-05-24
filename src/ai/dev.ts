
import { config } from 'dotenv';
config();

import '@/ai/flows/diagnose-illness.ts'; // General diagnosis
import '@/ai/flows/diagnose-its.ts';     // ITS diagnosis
import '@/ai/flows/generate-illness-image.ts'; // General image
import '@/ai/flows/generate-its-image.ts';     // ITS image
// If summarize-its-information.ts is used, ensure its import is also here.
// For example: import '@/ai/flows/summarize-its-information.ts';
