import { useState, useEffect } from "react";
import { Status } from "../../utils/constants";
import ServiceStatus from "../types/ServiceStatus";
import SystemStatus from "../types/SystemStatus";

function useSystemStatus() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // urls.cfg lives in the public folder and is served from the site root
                const response = await fetch("/urls.cfg");
                const configText = await response.text();
                const configLines = configText.split("\n");
                const services: ServiceStatus[] = [];
                for (let ii = 0; ii < configLines.length; ii++) {
                    const configLine = configLines[ii];
                    const [key, url] = configLine.split("=");
                    if (!key || !url) {
                        continue;
                    }
                    const status = await logs(key);

                    services.push(status);
                }
                
                if (services.every((item) => item.status === "success")) {
                    setSystemStatus({
                        title: "All System Operational",
                        status: Status.OPERATIONAL,
                        datetime: services[0].date
                    });
                } else if (services.every((item) => item.status === "failed")) {
                    setSystemStatus({
                        title: "Outage",
                        status: Status.OUTAGE,
                        datetime: services[0].date
                     });
                } else if (services.every((item) => item.status === "")) {
                    setSystemStatus({
                        title: "Unknown",
                        status: Status.UNKNOWN,
                        datetime: services[0].date
                    });
                } else {
                    setSystemStatus({
                        title: "Partial Outage",
                        status: Status.PARTIAL_OUTAGE,
                        datetime: services[0].date
                    });
                }
            } catch (e: any) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return {systemStatus, isLoading, error};
}

async function logs(key: string): Promise<ServiceStatus> {
    // read logs from the local public/status folder served at /status
    const resp = await fetch(`/status/${key}_report.log`);
    if (!resp.ok) {
        // missing or inaccessible log -> treat as unknown/empty so it doesn't incorrectly count as a failed service
        return {
            name: key,
            status: "",
            date: undefined,
        };
    }
    const text = await resp.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
        return {
            name: key,
            status: "",
            date: undefined,
        };
    }
    try {
        const line = lines[lines.length - 1];
        const [created_at, status, _] = line.split(", ");
        return {
            name: key,
            status: status,
            date: created_at,
        };
    } catch (e) {
        return {
            name: key,
            status: "",
            date: undefined,
        };
    }
}

export default useSystemStatus;
