import { FunctionComponent, useState } from 'react';
import { Status } from '../../../utils/constants';
import Service from "../../types/Service";
import StatusSection from '../../StatusSection';

interface ServiceItemProps {
    item: Service
}

const ServiceItem: FunctionComponent<ServiceItemProps> = ({ item }) => {
    const StatusName = () => {
        if (item?.status === Status.OPERATIONAL) {
            return <span className={"bg-green-500 px-2 py-1 rounded-xl text-white"} aria-hidden>OPERATIONAL</span>
        } else if(item?.status === Status.PARTIAL_OUTAGE) {
            return <span className={"bg-orange-400 px-2 py-1 rounded-xl text-white"} aria-hidden>PARTIAL OUTAGE</span>
        } else if(item?.status === Status.OUTAGE) {
            return <span className={"bg-red-500 px-2 py-1 rounded-xl text-white"} aria-hidden>OUTAGE</span>
        } else {
            return <span className={"bg-gray-400 px-2 py-1 rounded-xl text-white"} aria-hidden>UNKNOWN</span>
        }
    }

    const [panelOpen, setPanelOpen] = useState(false);

    return (
        <div className='mb-10 bg-white rounded-md p-4 shadow-sm'>
            <div className='flex items-center'>
                <div className="w-full flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-semibold leading-6 text-gray-900">{item.name}</p>
                        {/* chevron toggle (points down by default, rotates when open) */}
                        <button
                            onClick={() => setPanelOpen(p => !p)}
                            aria-expanded={panelOpen}
                            aria-label={`Toggle details for ${item.name}`}
                            className="p-0.5 rounded hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transform transition-transform duration-150 ${panelOpen ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                <path fillRule="evenodd" d="M14.77 7.79a.75.75 0 00-1.06-.02L10 11.44 6.29 7.77a.75.75 0 10-1.08 1.04l4.25 4.2a.75.75 0 001.08 0l4.23-4.2a.75.75 0 00-.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <p className='text-xs'> <StatusName /> </p>
                </div>
            </div>

            {/* Expanded panel injected when the name-chevron is toggled. This contains the pasted block's key pieces (card body + Recent incident). */}
            {panelOpen && (
                <div className="mx-px mt-6 md:ml-60 md:mr-60">
                    <StatusSection serviceId={item.id} />
                </div>
            )}

        </div>
    )
}

export default ServiceItem;