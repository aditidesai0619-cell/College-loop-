import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Icon from '../components/Icon';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Discover what's happening on campus — and never miss the moments that matter.">
      <form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to your account</h1>
        <p className="muted">View, register for and manage college events.</p>

        {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

        <label>Email
          <input type="email" autoComplete="email" placeholder="you@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>Password
          <input type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="btn btn-lg btn-block" disabled={loading}>
          {loading ? <><span className="spinner sm" aria-hidden="true" /> Logging in…</> : <>Log in <Icon name="arrowRight" size={17} /></>}
        </button>
        <p className="muted center">New student? <Link to="/register" className="text-link">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
