const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient('https://vxedefyjzbewawgjeurd.supabase.co',process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })

module.exports = supabase