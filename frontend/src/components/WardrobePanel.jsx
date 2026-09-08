import { useEffect, useRef, useState } from 'react';
import { wardrobeStore } from '../game/wardrobe/WardrobeStore.js';
import { useWardrobeState } from './useWardrobeState.js';
import WardrobeTabs from './WardrobeTabs.jsx';
import WardrobeItemCard from './WardrobeItemCard.jsx';
import StatsView from './StatsView.jsx';

/** Доля высоты панели, которую нужно пройти свайпом вниз для закрытия. */
const CLOSE_THRESHOLD_RATIO = 0.2;

/** Минимальное смещение пальца, после которого это свайп, а не клик. */
const DRAG_SLOP = 10;

/**
 * Боковая панель: две главные вкладки Гардероб и Статистика + кнопка Выйти.
 * ПК: сайдбар справа на всю высоту. Телефон: весь экран, свайп вниз закрывает.
 */
export default function WardrobePanel({ onLogout }) {
  const { isOpen, hearts, slots, stats } = useWardrobeState();
  const [mainTab, setMainTab] = useState('wardrobe');
  const [activeSlot, setActiveSlot] = useState(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const dragRef = useRef({ active: false, startY: 0, dy: 0 });
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!isOpen || slots.length === 0) return;
    const stillExists = slots.some((entry) => entry.slot === activeSlot);
    if (!stillExists) setActiveSlot(slots[0].slot);
  }, [isOpen, slots, activeSlot]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') wardrobeStore.close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    dragRef.current.active = false;
    if (panelRef.current) {
      panelRef.current.style.transition = '';
      panelRef.current.style.transform = '';
    }
  }, [isOpen]);

  const isCoarse = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  const onTouchStart = (event) => {
    if (!isCoarse()) return;
    if (listRef.current && listRef.current.scrollTop > 1) return;
    const touch = event.touches[0];
    dragRef.current = { active: true, startY: touch.clientY, dy: 0 };
  };

  const onTouchMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active || !panelRef.current) return;
    const touch = event.touches[0];
    const dy = Math.max(0, touch.clientY - drag.startY);
    drag.dy = dy;
    if (dy > DRAG_SLOP) {
      event.preventDefault();
      event.stopPropagation();
      if (listRef.current) {
        listRef.current.scrollTop = 0;
        listRef.current.style.overflowY = 'hidden';
      }
      panelRef.current.classList.add('wardrobe-panel--dragging');
    }
    panelRef.current.style.transition = 'none';
    panelRef.current.style.transform = `translateY(${dy}px)`;
  };

  const onTouchEnd = () => {
    const drag = dragRef.current;
    if (!drag.active || !panelRef.current) return;
    drag.active = false;
    const dy = drag.dy;
    const panelH = panelRef.current.offsetHeight || 1;
    if (listRef.current) listRef.current.style.overflowY = '';
    panelRef.current.classList.remove('wardrobe-panel--dragging');
    panelRef.current.style.transition = '';
    panelRef.current.style.transform = '';
    if (dy > DRAG_SLOP) suppressClickRef.current = true;
    if (dy >= panelH * CLOSE_THRESHOLD_RATIO) wardrobeStore.close();
  };

  const onClickCapture = (event) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const activeEntry = slots.find((entry) => entry.slot === activeSlot) || slots[0] || null;
  const safeStats = stats || { click: 0, crit: 0, passive: 0, limit: 0 };

  return (
    <>
      <div
        className={isOpen ? 'wardrobe-backdrop wardrobe-backdrop--open' : 'wardrobe-backdrop'}
        onClick={() => wardrobeStore.close()}
      />

      <section
        ref={panelRef}
        className={isOpen ? 'wardrobe-panel wardrobe-panel--open' : 'wardrobe-panel'}
        aria-hidden={!isOpen}
        onClickCapture={onClickCapture}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <header className="wardrobe-header">
          <span className="wardrobe-header__title">
            {mainTab === 'wardrobe' ? 'Гардероб' : 'Статистика'}
          </span>

          <span className="wardrobe-header__hearts">
            <img src="/assets/UI/HeartIcon.png" alt="" draggable="false" />
            {hearts.toLocaleString('ru-RU')}
          </span>

          <button type="button" className="wardrobe-header__logout" onClick={onLogout}>
            Выйти
          </button>

          <button
            type="button"
            className="wardrobe-header__close"
            onClick={() => wardrobeStore.close()}
            title="Закрыть"
          >
            <img src="/assets/UI/ClossButton.png" alt="Закрыть" draggable="false" />
          </button>
        </header>

        <div className="wardrobe-main-tabs">
          <button
            type="button"
            className={mainTab === 'wardrobe' ? 'wardrobe-main-tab wardrobe-main-tab--active' : 'wardrobe-main-tab'}
            onClick={() => setMainTab('wardrobe')}
          >
            Гардероб
          </button>
          <button
            type="button"
            className={mainTab === 'stats' ? 'wardrobe-main-tab wardrobe-main-tab--active' : 'wardrobe-main-tab'}
            onClick={() => setMainTab('stats')}
          >
            Статистика
          </button>
        </div>

        {mainTab === 'wardrobe' ? (
          <>
            <WardrobeTabs
              slots={slots}
              activeSlot={activeEntry ? activeEntry.slot : null}
              onSelect={setActiveSlot}
            />

            <div className="wardrobe-items" ref={listRef}>
              {activeEntry
                ? activeEntry.items.map((item) => (
                    <WardrobeItemCard
                      key={item.id}
                      item={item}
                      hearts={hearts}
                      onSelect={(itemId) => wardrobeStore.select(itemId)}
                    />
                  ))
                : null}
            </div>

            <footer className="wardrobe-footer">
              <span className="wardrobe-footer__stats">
                <span>Клик: {safeStats.click}</span>
                <span>Крит: {Math.round(safeStats.crit * 100)}%</span>
                <span>Пассив: {safeStats.passive}</span>
                <span>Лимит: {safeStats.limit.toFixed(1)}</span>
              </span>
              <span className="wardrobe-footer__hint">Свайп вниз — закрыть</span>
            </footer>
          </>
        ) : (
          <StatsView />
        )}
      </section>
    </>
  );
}
