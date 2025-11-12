import { Component, ErrorInfo, ReactNode } from 'react';
import { ArrowLeft, RotateCcw, Copy, Check } from 'lucide-react';
import logger from '@/lib/logger';
import error_boundary from '@/assets/error_boundary.png';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, showDetails: false, copied: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false, copied: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
      copied: false,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  copyError = async () => {
    if (this.state.error) {
      const errorText = `Error: ${this.state.error.message}\n\nStack Trace:\n${this.state.error.stack}`;
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8'>
          {/* Subtle Background Gradient */}
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background' />

          <div className='relative z-10 flex w-full max-w-2xl flex-col items-center gap-4 sm:gap-6'>
            {/* Image Section - Responsive sizing */}
            <div className='animate-in fade-in zoom-in duration-700 ease-out'>
              <div className='relative'>
                {/* Subtle glow behind image */}
                <div className='absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/10 blur-3xl' />

                <img
                  src={error_boundary}
                  alt='Error illustration'
                  className='h-48 w-48 object-contain drop-shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="flex h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 items-center justify-center rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm">
                        <svg class="h-24 w-24 sm:h-28 sm:w-28 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>

            {/* Text Content - Compact spacing */}
            <div className='animate-in fade-in slide-in-from-bottom-4 w-full space-y-2 text-center duration-700 delay-150 sm:space-y-3'>
              <div className='space-y-1 sm:space-y-2'>
                <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
                  Oops! Something broke
                </h1>
                <p className='text-sm text-muted-foreground sm:text-base'>
                  Don't worry, we've logged the error and will fix it soon.
                </p>
              </div>

              {/* Error Message Badge - Truncated on mobile */}
              {this.state.error && (
                <div className='mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm'>
                  <span className='relative flex h-2 w-2 flex-shrink-0'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75' />
                    <span className='relative inline-flex h-2 w-2 rounded-full bg-destructive' />
                  </span>
                  <span className='truncate font-medium text-destructive'>
                    {this.state.error.message}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons - Stack on mobile, row on desktop */}
            <div className='animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col items-stretch gap-2 duration-700 delay-300 sm:flex-row sm:items-center sm:justify-center sm:gap-3'>
              <button
                onClick={this.handleGoHome}
                className='group flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/20 hover:bg-accent hover:shadow-md active:scale-95 sm:px-5 sm:py-2.5'
              >
                <ArrowLeft className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 sm:h-4 sm:w-4' />
                Go back home
              </button>

              <button
                onClick={this.handleReset}
                className='group flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition-all hover:bg-foreground/90 hover:shadow-xl active:scale-95 sm:px-5 sm:py-2.5'
              >
                <RotateCcw className='h-3.5 w-3.5 transition-transform group-hover:rotate-180 sm:h-4 sm:w-4' />
                Try again
              </button>
            </div>

            {/* Technical Details Section - Compact */}
            {this.state.error && (
              <div className='animate-in fade-in slide-in-from-bottom-4 w-full space-y-2 duration-700 delay-500'>
                {/* Toggle Button */}
                <button
                  onClick={this.toggleDetails}
                  className='w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  <span className='inline-flex items-center gap-1 border-b border-dashed border-muted-foreground/30 pb-0.5 hover:border-foreground/50'>
                    {this.state.showDetails ? 'Hide' : 'Show'} technical details
                    <span
                      className={`text-[10px] transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </span>
                </button>

                {/* Stack Trace with Copy Button - Smaller max height */}
                {this.state.showDetails && this.state.error.stack && (
                  <div className='animate-in fade-in slide-in-from-top-2 space-y-1.5 duration-300'>
                    <div className='flex items-center justify-between rounded-t-lg border border-b-0 border-border/50 bg-muted/30 px-3 py-1.5 sm:px-4 sm:py-2'>
                      <span className='text-[10px] font-medium text-muted-foreground sm:text-xs'>
                        Stack Trace
                      </span>
                      <button
                        onClick={this.copyError}
                        className='flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs'
                      >
                        {this.state.copied ? (
                          <>
                            <Check className='h-3 w-3' />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className='h-3 w-3' />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className='max-h-32 overflow-auto rounded-b-lg border border-border/50 bg-muted/50 p-3 text-[10px] leading-relaxed text-muted-foreground sm:max-h-40 sm:text-[11px]'>
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Error Reference ID - Compact */}
            <div className='animate-in fade-in duration-700 delay-700'>
              <div className='flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1 sm:gap-2 sm:px-4 sm:py-1.5'>
                <span className='text-[9px] font-medium uppercase tracking-widest text-muted-foreground/60 sm:text-[10px]'>
                  Error ID
                </span>
                <span className='text-[9px] font-mono font-semibold text-muted-foreground sm:text-[10px]'>
                  {Date.now().toString(36).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
