// src/supabase/supabase.js

import { createClient }
from "@supabase/supabase-js";

const supabaseUrl =
  "https://belnlxxxpzgxfknsgeos.supabase.co";

const supabaseKey =
  "sb_publishable_KEh_DSX1PIMD2UZJSAtQkQ_6kud7Yiq";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );