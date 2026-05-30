import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';

const TABS = [
  { id: 'total_dives', label: '🕳️ Total Dives', unit: 'dives' },
  { id: 'daily_wins',  label: '🏆 Daily Wins',  unit: 'wins' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function Row({ rank, entry, isMe }) {
  const medal = MEDALS[rank - 1];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * Math.min(rank - 1, 12) }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
        isMe
          ? 'bg-[#F7C948] border-black shadow-[3px_3px_0_#111]'
          : 'bg-white border-black/10'
      }`}
    >
      <span className="font-display text-base w-8 shrink-0 text-center">
        {medal ?? <span className="text-black/40 font-body text-sm">#{rank}</span>}
      </span>
      <span className={`font-body font-bold text-sm flex-1 truncate ${isMe ? 'text-black' : 'text-black/80'}`}>
        {entry.display_name}
        {isMe && <span className="font-body font-normal text-[10px] text-black/50 ml-1">(you)</span>}
      </span>
      <span className={`font-display text-lg shrink-0 ${isMe ? 'text-[#E8432D]' : 'text-black/70'}`}>
        {entry.score}
      </span>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { user, openAuthModal } = useAuth();
  const { fetchBoard, userId }  = useLeaderboard();
  const [activeTab, setActiveTab] = useState('total_dives');
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBoard(activeTab).then(data => {
      setRows(data.map((r, i) => ({
        ...r,
        rank:  i + 1,
        score: activeTab === 'total_dives' ? r.total_dives : (r.daily_wins ?? 0),
      })));
      setLoading(false);
    });
  }, [activeTab, fetchBoard]);

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-[clamp(2.8rem,10vw,5rem)] text-fg leading-none mb-2">
          LEADERBOARD
        </h1>
        <p className="font-body text-base text-fg-muted">Who's gone the deepest?</p>
      </motion.div>

      {/* Sign-in nudge */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 card border-4 border-[#F7C948] shadow-[4px_4px_0_#111] p-4 flex items-center justify-between gap-4"
        >
          <p className="font-body text-sm text-black/70 flex-1">
            Sign in to appear on the board and track your rank.
          </p>
          <button
            onClick={openAuthModal}
            className="shrink-0 px-4 py-2 bg-[#E8432D] text-white font-display text-base border-2 border-black rounded-xl shadow-[2px_2px_0_#111] btn-press"
          >
            Sign in
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 font-body font-bold text-sm rounded-xl border-2 transition-all btn-press ${
              activeTab === tab.id
                ? 'bg-[#E8432D] text-white border-[#E8432D] shadow-[3px_3px_0_#111]'
                : 'bg-white text-black border-black/20 hover:border-black/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Board */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-black/5 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🕳️</p>
          <p className="font-display text-2xl text-fg mb-1">No one yet</p>
          <p className="font-body text-sm text-fg-muted">Be the first to appear!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(entry => (
            <Row
              key={entry.user_id}
              rank={entry.rank}
              entry={entry}
              isMe={entry.user_id === userId}
            />
          ))}
          <p className="font-body text-xs text-fg-faint text-center pt-2">
            Top 50 · ranked by {currentTab.label.replace(/[🔥🕳️]\s*/, '')} · {currentTab.unit}
          </p>
        </div>
      )}
    </div>
  );
}
