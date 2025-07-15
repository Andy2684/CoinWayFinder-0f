// components/auth/signup-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';

export default function SignupForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!id || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (checkPasswordStrength(password) < 3) {
      setError('Password is too weak. Use at least 8 characters, including uppercase, numbers, and special characters.');
      return;
    }

    try {
      await signup({ id, password, role });
      router.push('/'); // Redirect to homepage after successful signup
    } catch (error) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>
          User ID:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter user ID"
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            placeholder="Enter password"
          />
        </label>
        <p>Password Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength]}</p>
      </div>
      <div>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}