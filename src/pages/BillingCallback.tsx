import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function BillingCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || '';
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      setState('fail');
      setError('Missing payment reference.');
      return;
    }
    api
      .post('/billing/verify', { reference })
      .then(() => {
        setState('ok');
      })
      .catch((err: any) => {
        setState('fail');
        setError(err.message || 'Payment could not be confirmed.');
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
            <p className="text-sm text-text-muted">
              Confirming your payment...
            </p>
          </>
        )}
        {state === 'ok' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text">
              Subscription active
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Your workspace plan is updated. Welcome aboard.
            </p>
            <Link
              to="/app/billing"
              className="inline-block mt-5 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors"
            >
              Back to Billing
            </Link>
          </>
        )}
        {state === 'fail' && (
          <>
            <XCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text">
              Payment not confirmed
            </h2>
            <p className="text-sm text-text-muted mt-2">{error}</p>
            <Link
              to="/app/billing"
              className="inline-block mt-5 text-sm text-accent hover:underline"
            >
              Try again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
