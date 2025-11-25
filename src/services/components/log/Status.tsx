import { FunctionComponent } from "react"
import Log from "../../types/Log"
import LogDaySummary from "../../types/LogDaySummary"
import ServiceLog from './index'

interface ServiceLogProps {
    item?: LogDaySummary,
    logs?: LogDaySummary[],
    show: boolean,
    count?: number
}

const StatusView: FunctionComponent<ServiceLogProps> = ({ item, logs, show, count }) => {
    if (!show) return null;

    // if logs array is provided, render up to `count` entries (most recent first if already ordered)
    if (logs && logs.length > 0) {
        const sorted = logs.slice().sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
        const take = typeof count === 'number' ? count : 3;
        const list = sorted.slice(0, take);
        return (
            <div className="min-w-[220px] max-h-64 overflow-auto bg-white rounded-md shadow-lg p-3 text-sm text-gray-800">
                <p className="mb-2 text-xs text-gray-500">Last {list.length} days</p>
                <div className="flex gap-2 flex-wrap">
                    {list.map((l) => (
                        <ServiceLog key={l.date} item={l} />
                    ))}
                </div>
            </div>
        )
    }

    // fallback: single item view
    if (!item) return null;
    return (
        <div className="min-w-[180px] bg-white rounded-md shadow-lg p-3 text-sm text-gray-800">
            <p className="text-xs text-gray-500">Date</p>
            <p className="mb-2">{item.date}</p>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-medium">{item.status}</p>
        </div>
    )
}

export default StatusView;