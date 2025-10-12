"use client";

import React, { useState } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { signInWithGoogle, signInWithEmail, loading } = useAuthContext();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            await signInWithGoogle();
            router.push('/app');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            await signInWithEmail(email, password);
            router.push('/app');
        } catch (err: any) {
            setError(err.message || 'Email sign-in failed');
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Signing in...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md'>
                <div>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                        Sign in to your account
                    </h2>
                </div>
                
                <form className='mt-8 space-y-6' onSubmit={handleEmailSignIn}>
                    <div className='space-y-4'>
                        <div>
                            <Input
                                type='email'
                                placeholder='Email address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='w-full'
                            />
                        </div>
                        <div>
                            <Input
                                type='password'
                                placeholder='Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='w-full'
                            />
                        </div>
                    </div>

                    {error && (
                        <div className='text-red-600 text-sm text-center'>{error}</div>
                    )}

                    <div className='space-y-4'>
                        <Button
                            type='submit'
                            disabled={loading}
                            className='w-full'
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300' />
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className='w-full'
                        >
                            <svg className='w-5 h-5 mr-2' viewBox='0 0 48 48'>
                                <g>
                                    <path
                                        fill='#4285F4'
                                        d='M44.5 20H24v8.5h11.7C34.1 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5 0-1.4-.1-2.7-.3-4z'
                                    />
                                </g>
                            </svg>
                            Sign in with Google
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}