import useServices from './hooks/useServices';
import type { NextPage } from 'next'
import Service from './types/Service';
import ServiceItem from './components/service';
import IncidentsSection from '../incidents';
import useSystemStatus from './hooks/useSystemStatus';
import { Status } from '../utils/constants';


const ServicesSection: NextPage = () => {
    const [data, isServicesLoading] = useServices();
    const {systemStatus, isLoading} = useSystemStatus();

    const Icon = () => {
        const base = "inline-block rounded-full w-3 h-3 mr-3";
        if (systemStatus?.status === Status.OPERATIONAL) {
            return <span className={base + " bg-green-500"} aria-hidden />
        } else if(systemStatus?.status === Status.PARTIAL_OUTAGE) {
            return <span className={base + " bg-orange-400"} aria-hidden />
        } else if(systemStatus?.status === Status.OUTAGE) {
            return <span className={base + " bg-red-500"} aria-hidden />
        } else {
            return <span className={base + " bg-gray-400"} aria-hidden />
        }
    }

    return (
        <div className='mt-10'>
            <div className="mx-px md:ml-80 md:mr-80 bg-white rounded-xl card shadow-sm">
                <div className="w-full flex justify-between pt-2 pl-6 pr-6 pb-2">
                    <div className='flex items-center sm:text-xl text-xs font-semibold leading-7'>
                        <Icon />
                        <p className="ml-0 text-gray-900">{systemStatus?.title}</p>                        
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Last updated</p>
                        <p className="text-xs text-gray-400 text-end ">{systemStatus?.datetime}</p>
                    </div>
                </div>
            </div>
            <div className="mx-px mt-10 md:ml-60 md:mr-60">
                <div className="card-body">
                    {
                        isServicesLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {
                                    (data as Service[]).map(service => (
                                        <ServiceItem key={service.id} item={service} />
                                    ))
                                }
                            </ul>
                        )
                    }
                </div>
                <p className="mt-10 sm:text-lg	text-base font-semibold leading-7 text-gray-900">Recent incident</p>
                <IncidentsSection />
            </div>
        </div >
    )
}

export default ServicesSection;
