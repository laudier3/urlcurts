import { Suspense } from 'react';
import ResetPasswordPage from '../components/ResetPasswordPage';

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando página...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
