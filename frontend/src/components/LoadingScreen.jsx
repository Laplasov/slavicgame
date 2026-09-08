import { useEffect, useState } from 'react';

/** Сколько миллисекунд ждём slavicgame:ready до показа кнопки перезагрузки. */
const READY_TIMEOUT_MS = 20000;

/**
 * Экран загрузки: чёрный фон, энергетик, красное кольцо прогресса.
 * Прогресс плавно доходит до 90%, по событию slavicgame:ready добивается до 100%
 * и экран исчезает. Если игра не поднялась за READY_TIMEOUT_MS - кнопка перезагрузки.
 */
export default function LoadingScreen() {
  const [ready, setReady] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onReady = () => {
      setProgress(100);
      window.setTimeout(() => setReady(true), 250);
    };

    window.addEventListener('slavicgame:ready', onReady);

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 90) return value;
        return Math.min(90, value + 2);
      });
    }, 80);

    const stuckTimer = window.setTimeout(() => setStuck(true), READY_TIMEOUT_MS);

    return () => {
      window.removeEventListener('slavicgame:ready', onReady);
      window.clearInterval(timer);
      window.clearTimeout(stuckTimer);
    };
  }, []);

  if (ready) return null;

  if (stuck) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__text">Что-то пошло не так</div>
        <button
          type="button"
          className="auth-btn"
          onClick={() => window.location.reload()}
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div
        className="loading-screen__ring"
        style={{ '--loading-progress': `${progress * 3.6}deg` }}
      >
        <img
          className="loading-screen__monster"
          src="/assets/UI/Monster.png"
          alt=""
          draggable="false"
        />
      </div>
      <div className="loading-screen__text">Загрузка...</div>
    </div>
  );
}
