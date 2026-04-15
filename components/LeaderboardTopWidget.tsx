import Link from 'next/link';
import { Medal, Trophy } from 'lucide-react';

const medalStyles = [
  'from-yellow-400/35 to-amber-500/20 border-yellow-300/40 text-yellow-200',
  'from-slate-300/30 to-slate-400/20 border-slate-300/30 text-slate-200',
  'from-amber-700/30 to-orange-600/20 border-amber-500/30 text-amber-300',
];

const rankBadges = ['#1', '#2', '#3'];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

interface LeaderboardTopWidgetProps {
  users: LeaderboardEntry[];
}

const LeaderboardTopWidget = ({ users }: LeaderboardTopWidgetProps) => {
  const topUsers = users.slice(0, 3);

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="section-label">Community</p>
          <h3 className="mt-1 text-2xl font-extrabold text-foreground">Top Performers</h3>
        </div>
        <Trophy className="h-8 w-8 text-yellow-400" />
      </div>

      {topUsers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className={`rounded-2xl border bg-gradient-to-br p-4 transition-transform duration-200 hover:-translate-y-1 ${medalStyles[index] || medalStyles[2]}`}
            >
              <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                <span>{rankBadges[index] || `#${user.rank}`}</span>
                <Medal className="h-4 w-4" />
              </div>

              <div className="mb-3 flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full border border-border/50 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-xs font-bold text-foreground">
                    {getInitials(user.name)}
                  </div>
                )}
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              </div>

              <p className="text-xl font-extrabold text-foreground">{user.leaderboardScore.toFixed(2)}</p>
              <p className="text-xs text-foreground/75">Leaderboard Score</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/20 p-5 text-sm text-foreground/60">
          No completed interviews yet. Be the first to claim the top rank.
        </div>
      )}

      <div className="mt-5">
        <Link
          href="/leaderboard"
          className="inline-flex items-center rounded-full border border-primary-200/35 bg-primary-200/10 px-5 py-2 text-sm font-semibold text-primary-100 transition-all hover:border-primary-200/60 hover:bg-primary-200/20"
        >
          View Full Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardTopWidget;
