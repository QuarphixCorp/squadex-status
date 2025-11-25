import useServices from './hooks/useServices';
import type { NextPage } from 'next'
import Service from './types/Service';

const StatusSection: NextPage = () => {
    const [data, isServicesLoading] = useServices();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    };

    const colorClass = (status: string) => {
        switch (status) {
            case 'unknown':
                return 'bg-gray-300';
            case 'OUTAGE':
                return 'bg-red-500';
            case 'PARTIAL_OUTAGE':
                return 'bg-orange-400';
            default:
                return 'bg-green-500';
        }
    }

    return (
        <div className='mt-5'>
            {isServicesLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <p className="mr-5 text-xl font-semibold leading-6 text-gray-900">Recent status (last 3 days)</p>
                    <div className="mt-2 flex-1 h-px bg-gray-300" />
                    <div className="mt-4">
                        {((data as Service[]) || []).map((service) => {
                            // take most recent 3 logs (assuming logs are date strings)
                            const logs = (service.logs || []).slice().sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime())).slice(0, 3);
                            if (logs.length === 0) return null;
                            return (
                                <div className="mb-10" key={service.id}>
                                    <div className="ml-6 relative">
                                        {/* Stair-step layout with clean connector segments centered on markers */}
                                        {(() => {
                                            const stepX = 18; // horizontal step per item
                                            const stepY = 36; // vertical step per item
                                            const markerSize = 28; // px (w-7 h-7)
                                            const markerLeft = 8; // px from container left
                                            const lineLeft = markerLeft + (markerSize / 2) - 1; // center the 2px line

                                            return logs.map((log, idx) => (
                                                <div
                                                    className="relative"
                                                    key={log.date}
                                                    style={{ marginLeft: `${idx * stepX}px`, marginTop: idx === 0 ? 0 : `${stepY}px`, paddingLeft: `${markerLeft + markerSize + 12}px` }}
                                                >
                                                    {/* connector segment from previous marker down to this marker (drawn only for idx > 0) */}
                                                    {idx > 0 && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${lineLeft}px`,
                                                                top: `-${stepY - markerSize / 2}px`,
                                                                height: `${stepY}px`,
                                                                width: '2px',
                                                                background: '#e5e7eb'
                                                            }}
                                                        />
                                                    )}

                                                    {/* for the last (oldest) item, also draw a bottom connector so it has both top and bottom lines */}
                                                    {idx === logs.length - 1 && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${lineLeft}px`,
                                                                top: `${markerSize / 2}px`,
                                                                height: `${stepY}px`,
                                                                width: '2px',
                                                                background: '#e5e7eb'
                                                            }}
                                                        />
                                                    )}

                                                    <div className="flex">
                                                        <div className="absolute" style={{ left: `${markerLeft}px`, top: 0 }}>
                                                            <div className="flex rounded-full w-7 h-7 bg-gray-300 items-center justify-center">
                                                                <div className={`rounded-full w-3 h-3 ${colorClass(log.status)}`} />
                                                            </div>
                                                        </div>

                                                        <div className="items-center">
                                                            <p className="text-base font-semibold leading-6 text-gray-900">{formatDate(log.date)}</p>
                                                            <p className="text-sm text-gray-500">Status: {log.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatusSection;
