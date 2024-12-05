import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Nurse } from '../types/schedule';
import { useAuthStore } from '../stores/authStore';
import { validatePassword } from '../utils/validation';

interface UserManagementProps {
  onAddNurse: (nurse: Omit<Nurse, 'id'>) => Promise<void>;
}

export function UserManagement({ onAddNurse }: UserManagementProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const addUser = useAuthStore(state => state.addUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Mot de passe invalide');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const userId = await addUser({
        username,
        password,
        role: 'nurse'
      });

      await onAddNurse({ 
        name: username,
        userId 
      });
      
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur');
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter un(e) infirmier(ère)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            title="Le nom d'utilisateur ne doit contenir que des lettres, des chiffres et des underscores"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code d'accès
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
            minLength={8}
            title="Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
          />
          <p className="mt-1 text-sm text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}