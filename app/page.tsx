// app/page.tsx
import { ProtectedRoute } from '../components/auth/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <main>
        <h1>Welcome to CoinWayFinder</h1>
        <p>This is a protected page. Only authenticated users can see this.</p>
      </main>
    </ProtectedRoute>
  );
}