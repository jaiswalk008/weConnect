import { useForm } from 'react-hook-form';
import { Input } from '@weconnect/ui';
import { Button } from '@weconnect/ui';
import { Card, CardContent } from '@weconnect/ui';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import googleIcon from '@/assets/googleicon.svg';
import type { AuthFormProps, AuthFormData } from '@/types/auth';
import { useDispatch } from 'react-redux';
import { authActions } from '@/context/store';
import { authRoutes, protectedRoutes } from '@/routes/routes';
import { getMe } from '@/services/user';

const AuthForm: React.FC<AuthFormProps> = ({ title, onSubmit, onGoogleSignIn }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSignup = title === 'Signup';
  const dispatch = useDispatch();
  const handleFormSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const response = await onSubmit(data);
      toast.success(response.message);
      dispatch(
        authActions.initializeToken({
          authToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
      );
      const userDetails = await getMe();
      dispatch(authActions.setUserData(userDetails.data.user));
      navigate(protectedRoutes.HOME);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex justify-around items-center text-foreground">
      <div className="max-w-6xl min-h-screen gap-8 w-full justify-center flex lg:flex-row flex-col items-center px-4">
        {/* Left Section */}
        <div className="flex flex-col min-w-[50%] gap-4">
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Welcome to weConnect
          </motion.h1>

          <motion.p
            className="text-md hidden lg:block text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Connect with your friends and family
          </motion.p>

          <motion.p
            className="text-lg hidden lg:block text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            With weConnect, you can easily share media, voice/video call, and chat with your friends
            and family. Experience a seamless online experience that brings you closer to your loved
            ones.
          </motion.p>
        </div>

        {/* Right Section - Form */}
        <motion.div
          className="w-full lg:w-auto lg:min-w-[450px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="rounded-2xl shadow-xl border-border">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
                <h2 className="text-2xl font-semibold">{isSignup ? 'Sign up now' : 'Log in'}</h2>

                {isSignup && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Name"
                      {...register('name', { required: 'Name is required' })}
                      className="h-11"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with letters, numbers & symbols
                  </p>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button disabled={isLoading} type="submit" className="w-full h-11 cursor-pointer">
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isSignup ? (
                    'Sign up'
                  ) : (
                    'Log in'
                  )}
                </Button>

                <div className="flex items-center gap-3">
                  <hr className="grow border-border" />
                  <span className="text-sm font-medium text-muted-foreground">OR</span>
                  <hr className="grow border-border" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogleSignIn}
                  className="w-full h-11 cursor-pointer flex items-center justify-center gap-2"
                >
                  <img src={googleIcon} alt="google icon" height={24} width={24} />
                  <span>Continue with Google</span>
                </Button>

                <p className="text-sm text-center text-muted-foreground mt-2">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigate(isSignup ? authRoutes.LOGIN : authRoutes.SIGNUP)}
                    className="underline text-foreground font-medium hover:text-primary transition-colors"
                  >
                    {isSignup ? 'Log in' : 'Sign up'}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForm;
