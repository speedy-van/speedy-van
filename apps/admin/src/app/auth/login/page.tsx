'use client';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Handle redirect after session is established
  useEffect(() => {
    if (session?.user && !isLoading) {
      console.log('👤 Session established:', {
        role: (session.user as any).role,
        adminRole: (session.user as any).adminRole,
      });

      if ((session.user as any).role === 'admin') {
        console.log('🛠️ Redirecting to admin dashboard...');
        router.push('/admin');
      } else {
        console.log('🚪 Redirecting to portal...');
        router.push('/portal');
      }
    }
  }, [session, isLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);
    console.log('🔐 Attempting login for:', email);

    try {
      // Add a timeout to prevent hanging
      const signInPromise = signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SignIn timeout')), 10000)
      );

      const res = (await Promise.race([signInPromise, timeoutPromise])) as any;
      console.log('🔐 SignIn result:', res);

      if (res?.ok) {
        console.log('✅ SignIn successful, refreshing session...');

        // Force session refresh to get updated user data
        try {
          await update();
          console.log('✅ Session refreshed successfully');
        } catch (updateError) {
          console.log(
            '⚠️ Session refresh failed, trying alternative method:',
            updateError
          );

          // Alternative: manually fetch session
          try {
            const newSession = await getSession();
            console.log('✅ Manual session fetch successful:', newSession);
          } catch (fetchError) {
            console.log('❌ Manual session fetch failed:', fetchError);
          }
        }

        // Wait a bit for session to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if session was updated
        if (session?.user) {
          console.log('✅ Session updated, redirecting...');
        } else {
          console.log('⚠️ Session not updated, attempting direct redirect...');
          // Try direct redirect based on the user we know was authenticated
          router.push('/admin');
        }
      } else {
        console.log('❌ SignIn failed:', res?.error);
        setErr('Invalid email or password');
        setIsLoading(false);
      }
    } catch (error) {
      console.log('❌ SignIn error:', error);
      setErr('Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  // Show loading state while session is being established
  if (status === 'loading' || isLoading) {
    return (
      <main style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
        <h1>Login</h1>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p>Signing you in...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
      <h1>Login</h1>
      <form
        onSubmit={onSubmit}
        style={{ display: 'grid', gap: 12, marginTop: 16 }}
      >
        <input
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          data-testid="email-input"
          disabled={isLoading}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          data-testid="password-input"
          disabled={isLoading}
        />
        <button type="submit" data-testid="login-button" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
      <div style={{ marginTop: 16 }}>
        <a href="/auth/forgot">Forgot password?</a>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <p style={{ marginBottom: 8, color: '#666' }}>
          Don't have a driver account? Contact support to get started.
        </p>
        <a
          href="/driver-application"
          style={{
            color: '#3182ce',
            textDecoration: 'underline',
            fontWeight: '500',
          }}
        >
          Apply to become a driver
        </a>
      </div>
    </main>
  );
}
