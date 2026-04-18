import { useState } from "react";
import { apiRequest } from "../../services/api.js"

const useManualFetch = () => {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const execute = async (endpoint, method, body) => {
        setStatus('loading');
        setError(null);

        try {
            const result = await apiRequest({
                endpoint,
                method,
                body,
            });

            setData(result);
            setStatus("success");
            return result;
        } catch (err) {
            const backendError =
                err.response?.data?.error?.message ||
                err.message

            setError(backendError);
            setStatus("error");
            throw err;
        }
    };

    return { execute, data, status, error };
};

export default useManualFetch;