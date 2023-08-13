const { createClient } = require('@supabase/supabase-js')
require('dotenv').config();

// Create a single supabase client for interacting with your database
const supabase = createClient('https://vxedefyjzbewawgjeurd.supabase.co', process.env.SUPABASE_SERVICE_KEY)

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