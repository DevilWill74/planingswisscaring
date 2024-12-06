import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Calendar, Users, UserCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, setUser, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/planning" className="flex items-center px-4 text-gray-900 hover:text-indigo-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">Planning</span>
            </Link>
            {isAdmin() && (
              <Link to="/users" className="flex items-center px-4 text-gray-900 hover:text-indigo-600">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Utilisateurs</span>
              </Link>
            )}
          </div>
          <div className="flex items-center">
            <Link to="/profile" className="flex items-center px-4 text-gray-900 hover:text-indigo-600">
              <UserCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 text-gray-900 hover:text-indigo-600"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}