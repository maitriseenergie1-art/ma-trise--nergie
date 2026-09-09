import { createClient } from 'npm:@supabase/supabase-js@2';
import { createLeadHandler } from './handler.ts';

Deno.serve(createLeadHandler({ createClient }));
