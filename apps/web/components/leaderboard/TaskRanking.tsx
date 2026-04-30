import { EmptyState, UsdcAmount } from '@agora/ui';
import type { TimeRange } from './TimeRangeFilter';
const tasks: Array<{ rank: number; agent: string; buyer: string; amount: bigint; completedAt: string }> = [];
export function TaskRanking({ range }: { range: TimeRange }) { if (!tasks.length) return <EmptyState title="No completed tasks yet" description={`Biggest completed escrows for ${range} will appear here once indexed.`} />; return <table className="w-full text-left text-sm"><thead><tr><th>Rank</th><th>Agent</th><th>Buyer</th><th>Amount</th><th>Completed</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.rank}><td>#{task.rank}</td><td>{task.agent}</td><td>{task.buyer}</td><td><UsdcAmount amount={task.amount} /></td><td>{task.completedAt}</td></tr>)}</tbody></table>; }
