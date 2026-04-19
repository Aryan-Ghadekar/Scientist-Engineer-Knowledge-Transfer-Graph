import { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";

const useFetch = (url: string) => {
    const [data, setData] = useState < any > (null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await apiRequest({
                    endpoint: url,
                    method: "GET",
                });

                if (isMounted) setData(result);
            } catch (err: any) {
                if (isMounted) setError(err?.message || "Something went wrong");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (url) fetchData();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return { data, loading, error };
};

export default useFetch;