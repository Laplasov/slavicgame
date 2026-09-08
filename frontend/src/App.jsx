import { useEffect, useRef, useState } from 'react';
import { startGame } from './game/main.js';
import { ApiClient } from './api.js';
import { wardrobeStore } from './game/wardrobe/WardrobeStore.js';
import AuthScreen from './components/AuthScreen.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import WardrobeButton from './components/WardrobeButton.jsx';
import WardrobePanel from './components/WardrobePanel.jsx';
import './styles/wardrobe.css';

/**
 * Корневой компонент: управление сессией.
 * - При смене аккаунта (logout/login) гарантированно уничтожает старую игру,
 *   чтобы не осталось zombie-listener'ов beforeunload.
 * - При 409 от сервера (epoch не совпал) — reload, т.к. сессия устарела.
 */
export default function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [saveData, setSaveData] = useState(null);
  const [gameReady, setGameReady] = useState(false);

  // Сброс старой игры: уничтожаем Phaser, чтобы не осталось zombie-мостов
  const destroyGame = () => {
    if (gameRef.current) {
      try { gameRef.current.destroy(true); } catch (e) { /* ignore */ }
      gameRef.current = null;
    }
    setGameReady(false);
  };

  useEffect(() => {
    window.localStorage.removeItem('SlavicGameSave');
    if (!ApiClient.getToken()) {
      setBooting(false);
      return;
    }
    ApiClient.getSave()
      .then((save) => {
        setSession({ nickname: ApiClient.getNick() });
        setSaveData(save);
        setBooting(false);
      })
      .catch(() => {
        ApiClient.clear();
        setBooting(false);
      });
  }, []);

  useEffect(() => {
    const onReady = () => setGameReady(true);
    const onSessionExpired = () => {
      // Сервер сказал что epoch не совпал — сессия устарела, перезагружаем
      destroyGame();
      ApiClient.clear();
      window.location.reload();
    };
    window.addEventListener('slavicgame:ready', onReady);
    window.addEventListener('slavicgame:session-expired', onSessionExpired);
    return () => {
      window.removeEventListener('slavicgame:ready', onReady);
      window.removeEventListener('slavicgame:session-expired', onSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || gameRef.current || !saveData) return undefined;
    gameRef.current = startGame(containerRef.current, saveData);
    return () => {
      if (gameRef.current) {
        try { gameRef.current.destroy(true); } catch (e) { /* ignore */ }
        gameRef.current = null;
      }
    };
  }, [saveData]);

  const handleAuthSuccess = (nickname, save) => {
    // Перед входом в новый аккаунт гарантированно убиваем старую игру,
    // чтобы её zombie-мосты не слали PUT с новыми токенами
    destroyGame();
    setSession({ nickname });
    setSaveData(save);
  };

  const handleLogout = async () => {
    // НЕ делаем snapshot при logout — это может взять данные zombie-моста
    // от предыдущего аккаунта и записать их в новый. Последние 5 секунд
    // уже ушли на сервер через автосейв, этого достаточно.
    try {
      await ApiClient.logout();
    } catch (err) {
      // ignore
    }
    ApiClient.clear();
    // Сначала уничтожаем игру, потом сбрасываем состояние React.
    // Тогда bridge.destroy() снимет beforeunload до того, как токен исчезнет.
    destroyGame();
    setSaveData(null);
    setSession(null);
  };

  if (booting) return <LoadingScreen />;
  if (!session) return <AuthScreen onSuccess={handleAuthSuccess} />;
  if (!saveData) return <LoadingScreen />;

  return (
    <>
      <div id="game-container" ref={containerRef} />
      <WardrobeButton />
      <WardrobePanel onLogout={handleLogout} />
      {!gameReady && <LoadingScreen />}
    </>
  );
}
