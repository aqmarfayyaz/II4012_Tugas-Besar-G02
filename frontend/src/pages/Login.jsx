import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, startGoogleAuth, user, authLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const getErrorMessage = (err) => (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Login failed'
  );

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/projects');
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/projects');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    setOauthLoading(true);
    startGoogleAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-container-low">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">

        <section className="hidden md:flex flex-1 relative bg-primary items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center max-w-md">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-4xl">hub</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">TalentPulse AI</h1>
            <p className="text-base text-primary-fixed-dim mb-8">
              Empowering global enterprises with intelligent recruitment orchestration and predictive workforce analytics.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-primary-fixed-dim block mb-2">verified_user</span>
                <p className="text-xs font-semibold text-white">Institutional Trust</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-primary-fixed-dim block mb-2">bolt</span>
                <p className="text-xs font-semibold text-white">Operational Efficiency</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16">
          <div className="w-full max-w-sm mx-auto">

            <div className="md:hidden flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                <span className="text-2xl font-bold text-primary">TalentPulse</span>
              </div>
            </div>

            <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to home
            </Link>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
              <p className="text-sm text-on-surface-variant">Please enter your credentials to access the recruiter dashboard.</p>
            </div>

            <nav className="flex border-b border-outline-variant mb-8">
              <button className="px-6 py-3 text-sm font-semibold border-b-2 border-primary text-primary transition-colors">
                Login
              </button>
              <Link to="/register" className="px-6 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
                Register
              </Link>
            </nav>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Corporate Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container focus:border-primary-container outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Password</label>
                  <Link to="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container focus:border-primary-container outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-medium text-on-surface-variant cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {error && (
                <div className="p-3 bg-error-container text-on-error-container text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in...' : 'Access Dashboard'}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs text-outline">or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={oauthLoading}
                  className="flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full max-w-xs mx-auto"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
                </button>
              </div>
            </form>

            <footer className="mt-8 text-center">
              <p className="text-xs text-on-surface-variant">
                By accessing this portal, you agree to our{' '}
                <a href="#" className="text-primary hover:underline font-semibold">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline font-semibold">Privacy Policy</a>.
              </p>
            </footer>
          </div>
        </section>
      </div>

      <button className="fixed bottom-8 right-8 bg-white border border-outline-variant text-primary p-3 rounded-full shadow-lg hover:bg-surface-container-low transition-all flex items-center gap-2">
        <span className="material-symbols-outlined">support_agent</span>
        <span className="text-xs font-semibold hidden sm:inline pr-2">Support</span>
      </button>
    </div>
  );
};

export default Login;
