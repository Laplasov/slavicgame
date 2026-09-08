import { useState } from 'react';
import { ApiClient } from '../api.js';
import '../styles/auth.css';

/**
 * Экраны ВХОД и РЕГИСТРАЦИЯ на чёрном фоне.
 * Вход: логин, пароль, кнопка Войти, под ней ссылка Регистрация.
 * Регистрация: логин (ник), пароль, подтвердите пароль, кнопка Зарегистрироваться.
 * После успеха сразу загружает сейв и передаёт управление игре.
 */
export default function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setPassword2('');
  };

  const finish = async (data) => {
    ApiClient.setToken(data.access);
    ApiClient.setNick(data.nickname);
    // Epoch этой сессии: защита от затирания этого аккаунта zombie-клиентом
    ApiClient.setEpoch(data.epoch || '');
    const save = await ApiClient.getSave();
    onSuccess(data.nickname, save);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await finish(await ApiClient.login(nickname.trim(), password));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await finish(await ApiClient.register(nickname.trim(), password, password2));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        {mode === 'login' ? (
          <>
            <div className="auth-title">ВХОД</div>
            <form className="auth-form" onSubmit={submitLogin}>
              <label className="auth-label">
                Логин
                <input
                  className="auth-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="auth-label">
                Пароль
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-btn" type="submit" disabled={busy}>
                {busy ? 'Входим...' : 'Войти'}
              </button>
            </form>
            <button className="auth-link" type="button" onClick={() => switchMode('register')}>
              Регистрация
            </button>
          </>
        ) : (
          <>
            <div className="auth-title">РЕГИСТРАЦИЯ</div>
            <form className="auth-form" onSubmit={submitRegister}>
              <label className="auth-label">
                Логин (никнейм)
                <input
                  className="auth-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="auth-label">
                Пароль
                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="auth-label">
                Подтвердите пароль
                <input
                  className="auth-input"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button className="auth-btn" type="submit" disabled={busy}>
                {busy ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
              </button>
            </form>
            <button className="auth-link" type="button" onClick={() => switchMode('login')}>
              Уже есть аккаунт? Войти
            </button>
          </>
        )}
      </div>
    </div>
  );
}
