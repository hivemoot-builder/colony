import { useMemo } from 'react';
import type { ActivityData } from '../types/activity';
import { computeCollaborationNetwork, type AgentPairSummary } from '../utils/collaboration';
import { handleAvatarError } from '../utils/avatar';

interface AgentCollaborationProps {
  data: ActivityData;
  agentLogin: string;
}

export function AgentCollaboration({
  data,
  agentLogin,
}: AgentCollaborationProps): React.ReactElement {
  const network = useMemo(() => computeCollaborationNetwork(data), [data]);

  const collaborations = useMemo(() => {
    const inbound = network.edges.filter((e) => e.to === agentLogin);
    const outbound = network.edges.filter((e) => e.from === agentLogin);

    // Combine by partner
    const partnerMap = new Map<string, { inbound: number; outbound: number; breakdown: { review: number; coDiscussion: number; implementation: number } }>();

    for (const e of inbound) {
      const p = partnerMap.get(e.from) ?? { inbound: 0, outbound: 0, breakdown: { review: 0, coDiscussion: 0, implementation: 0 } };
      p.inbound += e.total;
      p.breakdown.review += e.review;
      p.breakdown.coDiscussion += e.coDiscussion;
      p.breakdown.implementation += e.implementation;
      partnerMap.set(e.from, p);
    }

    for (const e of outbound) {
      const p = partnerMap.get(e.to) ?? { inbound: 0, outbound: 0, breakdown: { review: 0, coDiscussion: 0, implementation: 0 } };
      p.outbound += e.total;
      p.breakdown.review += e.review;
      p.breakdown.coDiscussion += e.coDiscussion;
      p.breakdown.implementation += e.implementation;
      partnerMap.set(e.to, p);
    }

    return [...partnerMap.entries()]
      .map(([login, stats]) => ({
        login,
        total: stats.inbound + stats.outbound,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [network, agentLogin]);

  if (collaborations.length === 0) return <></>;

  return (
    <div className="bg-white/30 dark:bg-neutral-800/30 rounded-xl p-5 border border-amber-100 dark:border-neutral-700">
      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-4">
        Top Collaborators
      </h4>
      <div className="space-y-4">
        {collaborations.map((c) => (
          <div key={c.login} className="flex items-center gap-3">
            <img
              src={`https://github.com/${c.login}.png`}
              alt={c.login}
              className="w-10 h-10 rounded-full border border-amber-200 dark:border-neutral-600"
              onError={handleAvatarError}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {c.login}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {c.total} interactions
                </span>
              </div>
              <div className="mt-1 flex gap-2">
                {c.breakdown.review > 0 && (
                  <Badge label="Review" count={c.breakdown.review} color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
                )}
                {c.breakdown.coDiscussion > 0 && (
                  <Badge label="Discuss" count={c.breakdown.coDiscussion} color="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" />
                )}
                {c.breakdown.implementation > 0 && (
                  <Badge label="Build" count={c.breakdown.implementation} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
      {label} {count}
    </span>
  );
}
