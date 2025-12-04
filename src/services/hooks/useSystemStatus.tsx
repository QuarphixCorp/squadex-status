import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Status } from "../../utils/constants";
import ServiceStatus from "../types/ServiceStatus";
import SystemStatus from "../types/SystemStatus";

function useSystemStatus() {
    const router = useRouter();
    const [systemStatus, setSystemStatus] = useState<SystemStatus>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const basePath = router.basePath || "";
                const response = await fetch(`${basePath}/urls.cfg`);
                const configText = await response.text();
                const configLines = configText.split("\n");
                const services: ServiceStatus[] = [];
                for (let ii = 0; ii < configLines.length; ii++) {
                    const configLine = configLines[ii];
                    const [key, url] = configLine.split("=");
                    if (!key || !url) {
                        continue;
                    }
                    const status = await logs(key, basePath);

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

async function logs(key: string, basePath: string): Promise<ServiceStatus> {
    // read logs from the local public/status folder. Use basePath so the
    // files are correctly resolved when the site is hosted under a subpath.
    const resp = await fetch(`${basePath}/status/${key}_report.log`);
    if (!resp.ok) {
        // missing or inaccessible log -> treat as unknown/empty so it doesn't incorrectly count as a failed service
        return {
            name: key,
            status: "",
            date: "",
        };
    }
    const text = await resp.text();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
        return {
            name: key,
            status: "",
            date: "",
        };
    }
    try {
        const line = lines[lines.length - 1];
        const [created_at, status, _] = line.split(", ");
        return {
            name: key,
            status: status,
            date: created_at || "",
        };
    } catch (e) {
        return {
            name: key,
            status: "",
            date: "",
        };
    }
}

export default useSystemStatus;
