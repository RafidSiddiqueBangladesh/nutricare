import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Loader, AlertCircle, Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, error, clearError, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    setPasswordError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation
    if (!formData.name.trim()) {
      setPasswordError('Please enter your full name');
      return;
    }

    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setPasswordError('Please agree to terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(formData.email, formData.password, formData.name);
    } catch (err) {
      console.error('Sign up error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign up error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex gap-3 items-center justify-center mb-6"
          >
            <div className="w-12 h-12 rounded-2xl primary-color flex items-center justify-center">
              <Heart size={28} className="text-black" />
            </div>
            <h1 className="text-2xl font-black primary-text">Nutricare</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-black mb-2">Start Your Journey</h2>
            <p className="text-white/60">Create your account in seconds</p>
          </motion.div>
        </div>

        {/* Error Message */}
        {(error || passwordError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-2"
          >
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error || passwordError}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSignUp}
          className="glass-card space-y-4 mb-6"
        >
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="glass-input w-full pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-10"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-bold mb-2 text-white/80">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-10"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                setPasswordError('');
              }}
              className="mt-1 w-4 h-4 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="terms" className="text-xs text-white/60">
              I agree to the{' '}
              <a href="#" className="primary-text hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="primary-text hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.email || !formData.password || !acceptTerms}
            className="w-full py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
            style={{ background: `hsl(var(--primary-hue), 70%, 50%)` }}
          >
            {isSubmitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Create Account
              </>
            )}
          </button>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-bold text-white/40 uppercase">Or sign up with</span>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Google Sign Up */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleGoogleSignUp}
          type="button"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl font-bold border-2 hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ borderColor: `hsl(var(--primary-hue), 70%, 50%)` }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign Up with Google
        </motion.button>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-white/60"
        >
          Already have an account?{' '}
          <Link to="/auth/signin" className="primary-text font-bold hover:underline">
            Sign In
          </Link>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-4"
        >
          <Link to="/" className="text-white/40 hover:text-white/60 transition-colors text-sm">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
