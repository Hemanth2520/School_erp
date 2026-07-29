import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await apiClient.post('/auth/login', { email, password });
      navigate('/', { replace: true });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message ?? 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-muted flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div><h1 className="text-xl font-bold">EduERP</h1><p className="text-sm text-muted-foreground mt-1">Sign in to continue</p></div>
      {errorMessage && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
      <label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
      <label className="block text-sm font-medium">Password<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
      <button disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
}
