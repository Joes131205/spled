import axios from 'axios'

const authApi = axios.create({ baseURL: 'http://localhost:3001' })
const projectApi = axios.create({ baseURL: 'http://localhost:3003' })
const evidenceApi = axios.create({ baseURL: 'http://localhost:3003' }) // ← update port to match evidence-service .env PORT

const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
}

addAuthInterceptor(authApi)
addAuthInterceptor(projectApi)
addAuthInterceptor(evidenceApi)

export { authApi, projectApi, evidenceApi }