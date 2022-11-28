import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function get<T = never>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    axios
      .get(url, config)
      .then((r: AxiosResponse<T>) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function post<T = never>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    axios
      .post(url, data, config)
      .then((r: AxiosResponse<T>) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function put<T = never>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    axios
      .put(url, data, config)
      .then((r: AxiosResponse<T>) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function del<T = never>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    axios
      .delete(url, config)
      .then((r: AxiosResponse<T>) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function setCommonHeader(name: string, value: string): void {
  axios.defaults.headers.common[name] = value;
}

const HttpServices = {
  get,
  put,
  del,
  post,
  setCommonHeader,
};

export default HttpServices;
