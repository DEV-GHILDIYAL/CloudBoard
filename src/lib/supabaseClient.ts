import { createClient } from '@supabase/supabase-js';

// Read env variables (if any)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid-looking Supabase credentials
const hasCredentials =
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Real Supabase client instance (initialized if credentials exist)
const realClient = hasCredentials ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock database and auth implementation to allow immediate offline/local use
class MockSupabaseClient {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    // If we don't have a session, set up a default anonymous session or keep it null
    if (!localStorage.getItem('cb_session')) {
      // Start unauthenticated
    }
  }

  // --- Auth API ---
  auth = {
    signUp: async ({ email, password }: any) => {
      await new Promise((r) => setTimeout(r, 800)); // simulate latency
      const users = JSON.parse(localStorage.getItem('cb_mock_users') || '[]');
      if (users.some((u: any) => u.email === email)) {
        return { data: { user: null }, error: { message: 'User already exists.' } };
      }

      const newUser = { id: crypto.randomUUID(), email, password };
      users.push(newUser);
      localStorage.setItem('cb_mock_users', JSON.stringify(users));

      const session = {
        user: { id: newUser.id, email: newUser.email },
        access_token: 'mock-token-' + newUser.id,
      };
      localStorage.setItem('cb_session', JSON.stringify(session));
      this.triggerAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },

    signInWithPassword: async ({ email, password }: any) => {
      await new Promise((r) => setTimeout(r, 800));
      const users = JSON.parse(localStorage.getItem('cb_mock_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        return { data: { session: null, user: null }, error: { message: 'Invalid login credentials' } };
      }

      const session = {
        user: { id: user.id, email: user.email },
        access_token: 'mock-token-' + user.id,
      };
      localStorage.setItem('cb_session', JSON.stringify(session));
      this.triggerAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('cb_session');
      this.triggerAuthChange('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const sessionStr = localStorage.getItem('cb_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      return { data: { session }, error: null };
    },

    getUser: async () => {
      const sessionStr = localStorage.getItem('cb_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      return { data: { user: session ? session.user : null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.listeners.push(callback);
      // Run immediately with current state
      const sessionStr = localStorage.getItem('cb_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners = this.listeners.filter((l) => l !== callback);
            },
          },
        },
      };
    },
  };

  private triggerAuthChange(event: string, session: any) {
    this.listeners.forEach((l) => l(event, session));
  }

  // --- Database API ---
  from(table: string) {
    if (table !== 'projects') {
      throw new Error(`Mock only supports 'projects' table, got '${table}'`);
    }

    const getSessionUser = () => {
      const sessionStr = localStorage.getItem('cb_session');
      if (!sessionStr) return null;
      return JSON.parse(sessionStr).user;
    };

    const getProjects = () => {
      return JSON.parse(localStorage.getItem('cb_mock_projects') || '[]');
    };

    const saveProjects = (projects: any[]) => {
      localStorage.setItem('cb_mock_projects', JSON.stringify(projects));
    };

    return {
      select: (_columns?: string) => {
        const user = getSessionUser();
        if (!user) {
          return {
            eq: () => ({ single: async () => ({ data: null, error: { message: 'Unauthorized' } }) }),
            order: () => ({
              then: (cb: any) => cb({ data: [], error: { message: 'Unauthorized' } }),
            }),
            then: (cb: any) => cb({ data: [], error: { message: 'Unauthorized' } }),
          };
        }

        const userProjects = getProjects().filter((p: any) => p.user_id === user.id);

        const chain = {
          eq: (field: string, val: any) => {
            if (field === 'id') {
              const proj = userProjects.find((p: any) => p.id === val);
              return {
                single: async () => {
                  await new Promise((r) => setTimeout(r, 100));
                  if (!proj) return { data: null, error: { message: 'Project not found' } };
                  return { data: proj, error: null };
                },
              };
            }
            return {
              single: async () => ({ data: null, error: { message: 'Unsupported query filter' } }),
            };
          },
          order: (field: string, { ascending }: { ascending: boolean } = { ascending: true }) => {
            const sorted = [...userProjects].sort((a: any, b: any) => {
              const tA = new Date(a[field]).getTime();
              const tB = new Date(b[field]).getTime();
              return ascending ? tA - tB : tB - tA;
            });

            return {
              then: (cb: any) => {
                setTimeout(() => cb({ data: sorted, error: null }), 150);
                return Promise.resolve();
              },
            };
          },
          then: (cb: any) => {
            setTimeout(() => cb({ data: userProjects, error: null }), 150);
            return Promise.resolve();
          },
        };

        return chain;
      },

      insert: (projectArray: any[]) => {
        const user = getSessionUser();
        if (!user) {
          return {
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Unauthorized' } }),
            }),
          };
        }

        const projects = getProjects();
        const createdProjects = projectArray.map((p) => {
          const now = new Date().toISOString();
          return {
            id: p.id || crypto.randomUUID(),
            user_id: user.id,
            name: p.name || 'Untitled Project',
            data: p.data || { nodes: [], connections: [] },
            created_at: now,
            updated_at: now,
          };
        });

        projects.push(...createdProjects);
        saveProjects(projects);

        return {
          select: () => ({
            single: async () => {
              await new Promise((r) => setTimeout(r, 100));
              return { data: createdProjects[0], error: null };
            },
          }),
        };
      },

      update: (updateData: any) => {
        const user = getSessionUser();
        if (!user) {
          return { eq: () => ({ then: (cb: any) => cb({ data: null, error: { message: 'Unauthorized' } }) }) };
        }

        return {
          eq: (_field: string, val: any) => {
            return {
              then: async (cb: any) => {
                await new Promise((r) => setTimeout(r, 100));
                const projects = getProjects();
                const idx = projects.findIndex((p: any) => p.id === val && p.user_id === user.id);
                if (idx === -1) {
                  return cb({ data: null, error: { message: 'Project not found' } });
                }

                projects[idx] = {
                  ...projects[idx],
                  ...updateData,
                  updated_at: new Date().toISOString(),
                };
                saveProjects(projects);
                return cb({ data: projects[idx], error: null });
              },
            };
          },
        };
      },

      delete: () => {
        const user = getSessionUser();
        if (!user) {
          return { eq: () => ({ then: (cb: any) => cb({ error: { message: 'Unauthorized' } }) }) };
        }

        return {
          eq: (_field: string, val: any) => {
            return {
              then: async (cb: any) => {
                await new Promise((r) => setTimeout(r, 100));
                const projects = getProjects();
                const filtered = projects.filter((p: any) => !(p.id === val && p.user_id === user.id));
                saveProjects(filtered);
                return cb({ error: null });
              },
            };
          },
        };
      },
    };
  }
}

export const supabase = realClient || (new MockSupabaseClient() as any);
export const isMocked = !realClient;
