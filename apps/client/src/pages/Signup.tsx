import AuthForm from '../components/common/Auth';
import { authHandler, googleAuthHandler } from '../services/auth';
import type { AuthFormData } from '../types/auth';

function Signup() {
  return (
    <AuthForm
      title='Signup'
      onSubmit={(data: AuthFormData) => authHandler(data, true)}
      onGoogleSignIn={googleAuthHandler}
    />
  );
}

export default Signup;
