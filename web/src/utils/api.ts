import axios, { type AxiosInstance } from "axios";

const authApi: AxiosInstance = axios.create({
    baseURL: "http://127.0.0.1:3001",
});
const projectApi: AxiosInstance = axios.create({
    baseURL: "http://127.0.0.1:3003",
});
const evidenceApi: AxiosInstance = axios.create({
    baseURL: "http://127.0.0.1:3004",
});
const ghostBusterApi: AxiosInstance = axios.create({
    baseURL: "http://127.0.0.1:3002",
});

const addAuthInterceptor = (instance: AxiosInstance): void => {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
};

addAuthInterceptor(authApi);
addAuthInterceptor(projectApi);
addAuthInterceptor(evidenceApi);
addAuthInterceptor(ghostBusterApi);

export { authApi, projectApi, evidenceApi, ghostBusterApi };
