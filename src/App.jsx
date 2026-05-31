import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TrophyProvider } from './contexts/TrophyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Nav from './components/Nav';
import TrophyToast from './components/TrophyToast';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import RabbitHoles from './pages/RabbitHoles';
import Leaderboard from './pages/Leaderboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
    <TrophyProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-page">
          <Nav />
          <TrophyToast />
          <AuthModal />
          <div className="pb-24 md:pb-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/rabbit-holes" element={<RabbitHoles />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
            <footer className="flex justify-center gap-4 py-6">
              <a href="/privacy" className="font-body text-xs text-fg-muted hover:text-fg transition-colors">Privacy Policy</a>
              <span className="font-body text-xs text-fg-muted">·</span>
              <a href="/terms" className="font-body text-xs text-fg-muted hover:text-fg transition-colors">Terms of Service</a>
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </TrophyProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
