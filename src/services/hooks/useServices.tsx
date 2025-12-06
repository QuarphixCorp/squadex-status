import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Service from '../types/Service';
import Log from "../types/Log";
import LogDaySummary from "../types/LogDaySummary";
import { Status } from "../../utils/constants";

function useServices() {
    const router = useRouter();
    const [data, setData] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Get basePath from router - this is set in next.config.js for GitHub Pages
                const basePath = router.basePath || "";
                // use basePath so this works when the site is hosted under a subpath
                // (GitHub Pages project sites)
                const response = await fetch(`${basePath}/urls.cfg`);
                const configText = await response.text();
                const configLines = configText.split("\n");

                const services: Service[] = []
                for (let ii = 0; ii < configLines.length; ii++) {
                    const configLine = configLines[ii];
                    const [key, url] = configLine.split("=");
                    if (!key || !url) {
                        continue;
                    }
                    const log = await logs(key, basePath);

                    if (log.length > 0) {
                        services.push({ id: ii, name: key, status: log[log.length - 1].status, logs: log })
                    } else {
                        services.push({ id: ii, name: key, status: "unknown", logs: log })
                    }
                }
                setData(services as Service[]);
            } catch (e: any) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [router.basePath]);

    return [data, isLoading, error];
}

async function logs(key: string, basePath: string): Promise<LogDaySummary[]> {
    let resp = await fetch(`${basePath}/status/${key}_report.log`);
    if (!resp.ok) {
        try {
            const rawUrl = `https://raw.githubusercontent.com/QuarphixCorp/squadex-status/main/public/status/${key}_report.log`;
            resp = await fetch(rawUrl);
        } catch (e) {
        }
    }

    if (!resp.ok) {
        return [];
    }
    const text = await resp.text();
    const lines = text.split("\n");
    const logs: Log[] = [];
    const logDaySummary: LogDaySummary[] = [];

    lines.forEach((line: string) => {
        if (!line || line.trim().length === 0) return; // skip empty lines
        const [created_at, status, response_time] = line.split(", ");
        if (!created_at) return;
        logs.push({ id: created_at, response_time, status, created_at })
    })

    const prepareSummary = Object.values(logs.reduce((r: any, date) => {
        const [year, month, day] = date.created_at.substr(0, 10).split('-');
        const key = `${day}_${month}_${year}`;
        r[key] = r[key] || { date: date.created_at, logs: [] };
        r[key].logs.push(date);
        return r;
    }, {}));


    prepareSummary.forEach((logSummary: any) => {
        var avg_response_time = 0

        logSummary.logs.forEach((log: Log) => {
            if (log.response_time) {
                avg_response_time += Number(log.response_time.replaceAll('s', ''));
            }
        });

        let status = ""
        if (logSummary.logs.length === 0) {
            status = "unknown"
        } else if (logSummary.logs.every((item:any)=> item.status === 'success')) {
            status = Status.OPERATIONAL
        } else if (logSummary.logs.every((item:any)=> item.status === 'failed')) {
            status = Status.OUTAGE
        } else {
            status = Status.PARTIAL_OUTAGE
        }

        logDaySummary.push({
            avg_response_time: avg_response_time / logSummary.logs.length,
            current_status: logSummary.logs[logSummary.logs.length - 1].status,
            date: logSummary.date.substr(0, 10),
            status: status
        })
    })


    return fillData(logDaySummary);
}

function fillData(data: LogDaySummary[]): LogDaySummary[] {
    const logDaySummary: LogDaySummary[] = [];
    var today = new Date();

    for (var i = -1; i < 89; i += 1) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const summary = data.find((item) => item.date === d.toISOString().substr(0, 10));
        logDaySummary.push({
            avg_response_time: summary?.avg_response_time || 0,
            current_status: summary?.current_status || "unknown",
            date: d.toISOString().substr(0, 10),
            status: summary?.status || "unknown"
        })
    }

    return logDaySummary.reverse();
}


export default useServices;
