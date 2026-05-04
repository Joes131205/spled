import axios, { type AxiosInstance } from "axios";

const authApi: AxiosInstance = axios.create({
    baseURL: "http://localhost:3001",
});
const projectApi: AxiosInstance = axios.create({
    baseURL: "http://localhost:3003",
});
const evidenceApi: AxiosInstance = axios.create({
    baseURL: "http://localhost:3003",
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

export { authApi, projectApi, evidenceApi };
