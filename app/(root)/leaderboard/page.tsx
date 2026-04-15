import Link from "next/link";
import { Medal, Trophy, ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getLeaderboardSnapshot } from "@/lib/actions/leaderboard.action";

export const dynamic = "force-dynamic";

const medalClasses: Record<number, string> = {
  1: "text-yellow-300",
  2: "text-slate-300",
  3: "text-amber-500",
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default async function LeaderboardPage() {
  const currentUser = await requireAuth();
  const leaderboard = await getLeaderboardSnapshot({
    limit: 10,
    currentUserId: currentUser.uid,
  });

  const topUsers = leaderboard.topUsers;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#161728] via-[#1d1f35] to-[#111320] px-6 py-10 md:px-10 md:py-12">
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-primary-200/15 blur-3xl" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/30 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-100">
            <Trophy className="h-3.5 w-3.5" />
            Real-Time Rankings
          </div>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Leaderboard
          </h1>
          <p className="mt-3 max-w-3xl text-gray-300">
            Rankings are based on a balanced score: average interview score plus
            consistency bonus for completed interviews.
          </p>
        </div>
      </section>

      {currentUser && leaderboard.currentUser && (
        <section className="rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-900/25 via-indigo-900/20 to-purple-900/20 p-5">
          <p className="text-xs uppercase tracking-wider text-blue-200">
            Your Standing
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-white">
            <span className="rounded-full border border-blue-300/35 bg-blue-500/15 px-3 py-1 text-sm font-semibold">
              Rank #{leaderboard.currentUser.rank}
            </span>
            <span className="text-sm text-blue-100">
              Leaderboard Score:{" "}
              <span className="font-bold text-white">
                {leaderboard.currentUser.leaderboardScore.toFixed(2)}
              </span>
            </span>
            <span className="text-sm text-blue-100">
              Interviews:{" "}
              <span className="font-bold text-white">
                {leaderboard.currentUser.interviewsCompleted}
              </span>
            </span>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-gray-900/55 p-4 md:p-6">
        {topUsers.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-gray-800/45 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">
              No rankings yet
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Complete interviews to appear on the leaderboard.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/70 text-xs uppercase tracking-wide text-gray-300">
                  <tr>
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Average Score</th>
                    <th className="px-5 py-4">Interviews</th>
                    <th className="px-5 py-4">Leaderboard Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((entry) => {
                    const isCurrentUser = currentUser?.uid === entry.id;

                    return (
                      <tr
                        key={entry.id}
                        className={`border-t border-white/10 transition-colors ${isCurrentUser ? "bg-blue-500/10" : "hover:bg-white/5"}`}
                      >
                        <td className="px-5 py-4 font-bold text-white">
                          <span className="inline-flex items-center gap-2">
                            #{entry.rank}
                            {entry.rank <= 3 && (
                              <Medal
                                className={`h-4 w-4 ${medalClasses[entry.rank]}`}
                              />
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {entry.avatar ? (
                              <img
                                src={entry.avatar}
                                alt={entry.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                                {getInitials(entry.name)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">
                                {entry.name}
                              </p>
                              {isCurrentUser && (
                                <span className="inline-flex rounded-full border border-blue-300/40 bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-200">
                          {entry.averageScore.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-gray-200">
                          {entry.interviewsCompleted}
                        </td>
                        <td className="px-5 py-4 text-lg font-bold text-white">
                          {entry.leaderboardScore.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {topUsers.map((entry) => {
                const isCurrentUser = currentUser?.uid === entry.id;

                return (
                  <article
                    key={entry.id}
                    className={`rounded-xl border p-4 ${isCurrentUser ? "border-blue-400/40 bg-blue-900/20" : "border-white/10 bg-gray-800/45"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        #{entry.rank}
                      </span>
                      {entry.rank <= 3 && (
                        <Medal
                          className={`h-4 w-4 ${medalClasses[entry.rank]}`}
                        />
                      )}
                    </div>
                    <div className="mb-3 flex items-center gap-3">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                          {getInitials(entry.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{entry.name}</p>
                        {isCurrentUser && (
                          <p className="text-xs font-semibold text-blue-200">
                            You
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-black/20 p-2">
                        <p className="text-gray-400">Avg</p>
                        <p className="font-semibold text-white">
                          {entry.averageScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-black/20 p-2">
                        <p className="text-gray-400">Done</p>
                        <p className="font-semibold text-white">
                          {entry.interviewsCompleted}
                        </p>
                      </div>
                      <div className="rounded-lg bg-black/20 p-2">
                        <p className="text-gray-400">Score</p>
                        <p className="font-semibold text-white">
                          {entry.leaderboardScore.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
