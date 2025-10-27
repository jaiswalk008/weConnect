
import { authHandler } from '@/services/auth';
import AuthForm from '../components/common/Auth'
import type { AuthFormData } from '../types/auth'

function Login() {
  return (
    <AuthForm title="Login" onSubmit={(data:AuthFormData) => authHandler(data, false)} onGoogleSignIn={() => {}} />
  )
}

export default Login;