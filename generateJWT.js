const { createClient } = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient('https://vxedefyjzbewawgjeurd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZWRlZnlqemJld2F3Z2pldXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTExMzA5NjIsImV4cCI6MjAwNjcwNjk2Mn0.P0XkbK9JFgyzZzEWYvdPJ8Mu3APGBB_R_u1zn1vzFnE')

async function main() {

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'example@email.com',
        password: 'example-password',
    })
    console.log({
        data,
        error
    })

}
main()