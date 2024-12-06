import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize schema
const initSchema = async () => {
  const { error: dropError } = await supabase.rpc('drop_all_tables', {});
  
  // Create users table
  const { error: usersError } = await supabase.query(`
    create table if not exists users (
      id uuid default uuid_generate_v4() primary key,
      username text unique not null,
      password text not null,
      role text not null check (role in ('admin', 'nurse')),
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
  `);

  // Create planning table
  const { error: planningError } = await supabase.query(`
    create table if not exists planning (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references users(id) on delete cascade,
      date date not null,
      status text not null check (status in ('work', 'rest', 'vacation', 'training', 'unavailable', 'undefined')),
      note text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      unique(user_id, date)
    );
  `);

  // Create default admin user
  const { error: adminError } = await supabase
    .from('users')
    .upsert([
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      }
    ], { onConflict: 'username' });

  if (usersError || planningError || adminError) {
    console.error('Schema initialization errors:', { usersError, planningError, adminError });
  }
};

// Initialize schema on client creation
initSchema().catch(console.error);

export { initSchema };