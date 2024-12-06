-- Désactiver temporairement RLS
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedules DISABLE ROW LEVEL SECURITY;
-- Supprimer les anciennes tables
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- Créer la table users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'nurse')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
-- Créer la table schedules
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    user_id TEXT REFERENCES users(id),
    schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(key)
);
-- Accorder les permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
-- Politiques pour users
CREATE POLICY "Lecture publique des utilisateurs"
    ON users FOR SELECT
    USING (true);
CREATE POLICY "Modification des utilisateurs par admin"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.role = 'admin'
        )
        OR NOT EXISTS (SELECT 1 FROM users)
    );
-- Politiques pour schedules
CREATE POLICY "Lecture publique des plannings"
    ON schedules FOR SELECT
    USING (true);
CREATE POLICY "Modification de son propre planning"
    ON schedules FOR ALL
    USING (
        user_id = (SELECT id FROM users WHERE role = 'admin')
        OR user_id = (
            SELECT id FROM users 
            WHERE id = schedules.user_id
        )
    );
-- Créer l'admin par défaut
INSERT INTO users (id, username, password, role)
VALUES ('admin', 'admin', 'admin123', 'admin')
ON CONFLICT (id) DO NOTHING;