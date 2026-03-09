import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { id: string; tenant_id: string; name: string; email: string; avatar_url: string | null; status: string; phone: string; timezone: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

const PUBLIC_ROUTES = ['/login', '/signup', '/form'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile for the current user
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, tenant_id, name, email, avatar_url')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(data as AuthContextType['profile']);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      if (existing?.user) {
        fetchProfile(existing.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Route guard
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.some(r => location.pathname.startsWith(r));
    if (!session && !isPublic) {
      navigate('/login', { replace: true });
    }
    if (session && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/', { replace: true });
    }
  }, [session, loading, location.pathname, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
