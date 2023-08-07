const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient('https://vxedefyjzbewawgjeurd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZWRlZnlqemJld2F3Z2pldXJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTEzMDk2MiwiZXhwIjoyMDA2NzA2OTYyfQ.eMwFln8q4pIBTP3TSa8N98FN_6JhZOGhAX6qDnCCt_k', { auth: { persistSession: false } })

module.exports = supabase