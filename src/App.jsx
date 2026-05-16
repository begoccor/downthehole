import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TrophyProvider } from './contexts/TrophyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Nav from './components/Nav';
import TrophyToast from './components/TrophyToast';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import RabbitHoles from './pages/RabbitHoles';

export default function App() {
  return (
    <LanguageProvider>
    <TrophyProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-page">
          <Nav />
          <TrophyToast />
          <div className="pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/rabbit-holes" element={<RabbitHoles />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TrophyProvider>
    </LanguageProvider>
  );
}
