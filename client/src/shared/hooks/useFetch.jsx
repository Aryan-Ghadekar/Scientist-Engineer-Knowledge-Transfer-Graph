import { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect (() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiRequest({
                endpoint: url,
                method : 'GET',
            });

            setData(result);
        } catch (err) {
            setError(err.message);
            // setStatus("error");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    if(url) fetchData();
    }, [url]);

    return { data, loading, error };
};

export default useFetch;