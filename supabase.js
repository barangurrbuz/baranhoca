import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://lvqyqpzwnmkygydrjujq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cXlxcHp3bm1reWd5ZHJqdWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODE5NTYsImV4cCI6MjA2ODk1Nzk1Nn0.Ape-ae6e6S49FaAqi8zNLAj0iI4T8YhTD5ZgjIDtcKs'

export const supabase = createClient(supabaseUrl, supabaseKey)
