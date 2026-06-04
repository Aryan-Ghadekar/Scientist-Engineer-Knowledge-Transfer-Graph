const BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:8000/";

export const apiRequest = async ({
    endpoint,
    method = "GET",
    body = null,
    headers = {},
}) => {
    try {
        const options ={
            method,
            credentials: "include",
            headers: {
                ...headers,
            }
        };

        if(body instanceof FormData) {
            options.body = body;
        } else if(body){
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, options);

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.message || "API ERROr");
        }

        return data;
    } catch(error){
        throw error;
    }
};