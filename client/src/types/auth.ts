export interface AuthFormData {
  name: string;
  email: string;
  password: string;
}

export interface AuthFormProps {
  /**
   * The title of the form, defaults to 'Login'
   */
  title?: string;
  
  /**
   * Callback function that is called when the form is submitted
   * @param data - The form data containing user credentials
   */
  onSubmit: (data: AuthFormData) => Promise<AuthResponse>;
  
  /**
   * Callback function that is called when the Google sign-in button is clicked
   */
  onGoogleSignIn: () => void;
}

export interface AuthFormErrors {
  name?: {
    message?: string;
  };
  email?: {
    message?: string;
  };
  password?: {
    message?: string;
  };
}

export interface AuthResponse {
  message:string;
  accessToken:string;
  refreshToken:string;    
}
