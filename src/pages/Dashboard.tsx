import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  Layout,
  Plus,
  Trash2,
  Edit,
  LogOut,
  FolderOpen,
  Clock,
  X,
  Check,
  Search,
  User,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
  data: any;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // States for Modals
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDataAndProjects();
  }, []);

  const fetchUserDataAndProjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'Developer');
      }

      // Fetch projects ordered by updated_at descending
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCreateProject = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const initialBoard = {
        nodes: [],
        connections: [],
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: 'Untitled Project',
          data: initialBoard,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        alert('Failed to create project: ' + error.message);
      } else if (data) {
        navigate(`/board/${data.id}`);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingProject || !newName.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newName.trim() })
        .eq('id', renamingProject.id);

      if (error) {
        alert('Failed to rename: ' + error.message);
      } else {
        setProjects((prev) =>
          prev.map((p) => (p.id === renamingProject.id ? { ...p, name: newName.trim(), updated_at: new Date().toISOString() } : p))
        );
        setRenamingProject(null);
      }
    } catch (err) {
      console.error('Failed to rename:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deletingProject.id);

      if (error) {
        alert('Failed to delete project: ' + error.message);
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
        setDeletingProject(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Nav Header */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-2 rounded-xl">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              CloudBoard
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-350">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-2 text-sm font-semibold transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 z-10">
        {/* Dashboard Title & Actions bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1.5">My Architecture Boards</h1>
            <p className="text-sm text-slate-400">Create, customize, and manage your cloud network designs.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-full sm:w-60 placeholder-slate-650 text-slate-100"
              />
            </div>

            <button
              onClick={handleCreateProject}
              disabled={actionLoading}
              className="bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-650/15 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-slate-400 text-sm mt-4 font-medium">Fetching architectural boards...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty / No results state */
          <div className="py-20 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center px-6">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-full text-slate-500 mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              {searchQuery ? 'No matching projects' : 'No projects saved yet'}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              {searchQuery
                ? 'Try searching with a different name or browse all diagrams.'
                : 'Get started by creating your very first cloud architecture configuration.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateProject}
                disabled={actionLoading}
                className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-650/15 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Board</span>
              </button>
            )}
          </div>
        ) : (
          /* Projects grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:translate-y-[-2px] group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Link
                      to={`/board/${project.id}`}
                      className="text-lg font-bold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1 flex-1 cursor-pointer"
                    >
                      {project.name}
                    </Link>

                    {/* Rename/Delete Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setRenamingProject(project);
                          setNewName(project.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-all"
                        title="Rename Project"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProject(project)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(project.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/board/${project.id}`}
                  className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 py-3 rounded-xl text-xs font-semibold text-center text-slate-300 group-hover:text-indigo-400 transition-all block mt-auto"
                >
                  Open Board Canvas
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rename Dialog Modal */}
      {renamingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Rename Architecture Board</h3>
              <button
                onClick={() => setRenamingProject(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  New Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Production Cluster Layout"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newName.trim()}
                  className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-2">Delete Board Configuration?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{deletingProject.name}"</span>?
              This will permanently destroy all node layout maps and connection routing. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Keep Board
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={actionLoading}
                className="bg-rose-650 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
