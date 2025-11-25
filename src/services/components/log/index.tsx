import { FunctionComponent, useState } from 'react';
import { Status } from '../../../utils/constants';
import LogDaySummary from '../../types/LogDaySummary';
import StatusView from './Status';

interface ServiceLogProps {
    item: LogDaySummary,
    logs?: LogDaySummary[]
}

const ServiceLog: FunctionComponent<ServiceLogProps> = ({ item, logs }) => {
    const [open, setOpen] = useState(false);

    const colorClass = (status: string) => {
        switch (status) {
            case 'unknown':
                return 'bg-gray-300';
            case Status.OUTAGE:
                return 'bg-red-500';
            case Status.PARTIAL_OUTAGE:
                return 'bg-orange-400';
            default:
                return 'bg-green-500';
        }
    }

    return (
        <div className='relative inline-block'>
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-3 h-3 rounded-full ${colorClass(item.status)} focus:outline-none`} 
                aria-label={`Status for ${item.date}`}
            />

            {/* dropdown */}
            {open && (
                <div className="absolute z-10 mt-2 left-1/2 -translate-x-1/2">
                    <StatusView item={item} show={open} logs={logs} />
                </div>
            )}
        </div>
    )
}

export default ServiceLog;