import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zaxngndmftxnoaeqqgso.supabase.co"
const supabaseKey = "sb_publishable_VDOqFESk_iUpcmSvCmsBYg_cLTuGf8p"

export const supabase = createClient(supabaseUrl, supabaseKey);