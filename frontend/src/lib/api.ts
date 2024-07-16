import axios, { AxiosResponse } from "axios";
import config from "@/../../config.json";

export const backendURL = `${config.BACKEND_URL}:${config.BACKEND_PORT}`;
const backend = axios.create({
    baseURL: backendURL,
    timeout: 5000,
});

export type APIReturn =
    | {
          success: true;
          response: AxiosResponse;
      }
    | {
          success: false;
          error: {
              message: string;
              code: number;
          };
      };

export async function register(
    email: string,
    password: string,
    name: string
): Promise<APIReturn> {
    return backend
        .post("/admin/auth/register", {
            email,
            password,
            name,
        })
        .then((response) => {
            return {
                success: true,
                response,
            } as APIReturn;
        })
        .catch((error) => {
            return {
                success: false,
                error: {
                    code: error.response.status,
                    message: error.response.data.error,
                },
            };
        });
}

export async function login(
    email: string,
    password: string
): Promise<APIReturn> {
    return backend
        .post("/admin/auth/login", {
            email,
            password,
        })
        .then((response) => {
            return {
                success: true,
                response,
            } as APIReturn;
        })
        .catch((error) => {
            return {
                success: false,
                error: {
                    code: error.response.status,
                    message: error.response.data.error,
                },
            };
        });
}

export async function logout(token: string): Promise<APIReturn> {
    return backend
        .post("/admin/auth/logout", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            return {
                success: true,
                response,
            } as APIReturn;
        })
        .catch((error) => {
            return {
                success: false,
                error: {
                    code: error.response.status,
                    message: error.response.data.error,
                },
            };
        });
}

export async function getStore(token: string): Promise<APIReturn> {
    return backend
        .get("/store", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            return {
                success: true,
                response,
            } as APIReturn;
        })
        .catch((error) => {
            return {
                success: false,
                error: {
                    code: error.response.status,
                    message: error.response.data.error,
                },
            };
        });
}

export async function putStore(
    token: string,
    store: object
): Promise<APIReturn> {
    return backend
        .put(
            "/store",
            { store },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            return {
                success: true,
                response,
            } as APIReturn;
        })
        .catch((error) => {
            return {
                success: false,
                error: {
                    code: error.response.status,
                    message: error.response.data.error,
                },
            };
        });
}
