import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { MandiPage } from './pages/MandiPage';
import { WeatherPage } from './pages/WeatherPage';
import { ConsultancyPage } from './pages/ConsultancyPage';
import { SchemesPage } from './pages/SchemesPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <VoiceProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/mandi" element={<MandiPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/consultancy" element={<ConsultancyPage />} />
                <Route path="/schemes" element={<SchemesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </VoiceProvider>
    </LanguageProvider>
  );
};

export default App;
