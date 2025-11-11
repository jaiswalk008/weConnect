import { authHandler, googleAuthHandler } from '@/services/auth';
import AuthForm from '../components/common/Auth';
import type { AuthFormData } from '../types/auth';

function Login() {
  return (
    <AuthForm
      title="Login"
      onSubmit={(data: AuthFormData) => authHandler(data, false)}
      onGoogleSignIn={googleAuthHandler}
    />
  );
}

export default Login;
