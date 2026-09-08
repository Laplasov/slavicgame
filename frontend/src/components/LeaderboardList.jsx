import { useEffect, useState } from 'react';
import { ApiClient } from '../api.js';

/**
 * Топ-50 игроков: место - ник - сердца (всего собрано).
 * Загружается с сервера при открытии подвкладки Рекорды.
 * Автообновляется каждые 30 секунд без перезагрузки страницы.
 */
export default function LeaderboardList() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const load = () => {
      ApiClient.leaderboard()
        .then((data) => {
          if (alive) setRows(data.rows || []);
        })
        .catch((err) => {
          if (alive && !rows) setError(err.message);
        });
    };

    load();
    // Автообновление каждые 30 секунд
    const interval = setInterval(load, 30000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  if (error) return <div className="auth-error">{error}</div>;
  if (!rows) return <div className="stats-hint">Загрузка рекордов...</div>;
  if (rows.length === 0) return <div className="stats-hint">Пока никто не играет. Будь первым!</div>;

  return (
    <div className="leader-list">
      {rows.map((row) => (
        <div className="leader-row" key={row.place}>
          <span className="leader-place">{row.place}</span>
          <span className="leader-nick">{row.nickname}</span>
          <span className="leader-hearts">{row.hearts.toLocaleString('ru-RU')}</span>
        </div>
      ))}
    </div>
  );
}
