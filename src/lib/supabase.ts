import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwouhdlarfqovfsomxli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b3VoZGxhcmZxb3Zmc29teGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTczMDksImV4cCI6MjA5OTc3MzMwOX0.VGZmOGFCdK46HhVzkQSi65kr0_4Tmi1ioP96SDKSV9o';

export const supabase = createClient(supabaseUrl, supabaseKey);
