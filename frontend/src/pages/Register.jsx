import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import Icon from '../components/Icon';

const DEPARTMENTS = ['CSE', 'CSE-DS', 'AI/ML', 'ECE', 'IoT', 'R&AI', 'BBA'];

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — welcome aboard!');
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Join the clubs, workshops and performances that make campus life memorable.">
      <form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">Student registration</span>
        <h1>Create your account</h1>
        <p className="muted">Register for events and keep track of everything you're attending.</p>

        {error && <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error}</div>}

        <label>Full name
          <input name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={set} required />
        </label>
        <label>Email
          <input type="email" name="email" autoComplete="email" placeholder="you@college.edu" value={form.email} onChange={set} required />
        </label>
        <div className="grid-2">
          <label>Password
            <input type="password" name="password" autoComplete="new-password" minLength="6" placeholder="Min 6 characters" value={form.password} onChange={set} required />
          </label>
          <label>Department
            <select name="department" value={form.department} onChange={set} required>
              <option value="">Select</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <button className="btn btn-lg btn-block" disabled={loading}>
          {loading ? <><span className="spinner sm" aria-hidden="true" /> Creating…</> : <>Create account <Icon name="arrowRight" size={17} /></>}
        </button>
        <p className="muted center">Already registered? <Link to="/login" className="text-link">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
