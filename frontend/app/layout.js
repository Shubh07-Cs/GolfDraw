import './globals.css';
import { AuthProvider } from '../hooks/useAuth';

export const metadata = {
  title: 'GolfDraw — Play Golf, Win Prizes, Support Charities',
  description: 'The premier golf subscription platform. Submit your scores, enter monthly prize draws, and support amazing charities. Join thousands of golfers making a difference.',
  keywords: 'golf, subscription, prize draw, charity, golf scores, monthly prizes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
