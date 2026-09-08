import { useState } from 'react';
import { useWardrobeState } from './useWardrobeState.js';
import LeaderboardList from './LeaderboardList.jsx';

/**
 * Вкладка Статистика в боковой панели.
 * Подвкладка Моя статистика: количество кликов и собранных сердец.
 * Подвкладка Рекорды: топ-50 игроков (место - ник - сердца).
 */
export default function StatsView() {
  const { playerStats } = useWardrobeState();
  const [sub, setSub] = useState('mine');
  const stats = playerStats || { totalClicks: 0, totalHeartsCollected: 0 };

  return (
    <div className="stats-view">
      <div className="wardrobe-tabs">
        <button
          type="button"
          className={sub === 'mine' ? 'wardrobe-tab wardrobe-tab--active' : 'wardrobe-tab'}
          onClick={() => setSub('mine')}
        >
          Моя статистика
        </button>
        <button
          type="button"
          className={sub === 'records' ? 'wardrobe-tab wardrobe-tab--active' : 'wardrobe-tab'}
          onClick={() => setSub('records')}
        >
          Рекорды
        </button>
      </div>

      {sub === 'mine' ? (
        <div className="stats-mine">
          <div className="stats-row">
            <span>Количество кликов</span>
            <b>{stats.totalClicks.toLocaleString('ru-RU')}</b>
          </div>
          <div className="stats-row">
            <span>Собрано сердец</span>
            <b>{stats.totalHeartsCollected.toLocaleString('ru-RU')}</b>
          </div>
        </div>
      ) : (
        <LeaderboardList />
      )}
    </div>
  );
}
