import { createContext, useState } from "react";
import Roles from "../core/roles";
import Jwt from "../interfaces/jwt";
import jwt_decode from "jwt-decode";
import HttpServices from "../services/HttpServices";
import IAccessToken from "../interfaces/IAccessToken";
import { IToastMessage } from "../common/ToastMessages";
import { AxiosError } from "axios";
import AppConfig from "../core/app-config";

export interface GlobalState {
  isUserAuthenticated: boolean;
  isUserSeller: boolean;
  isUserBuyer: boolean;
  jwt?: Jwt;
  userId?: string;
  onLogin?: (jwt: Jwt, isFromUi: boolean) => void;
  onLogout?: () => void;
  // App Messages:
  appMessages: IToastMessage[];
  showMessage?: (msg: IToastMessage) => void;
  showSuccess?: (msg: string, autohide?: boolean) => void;
  showError?: (msg: string, autohide?: boolean) => void;
  showException?: (exception: any, autohide?: boolean) => void;
  closeMessage?: (msgIndex: number) => void;
}

export const APP_DEFAULT_STATE: GlobalState = {
  isUserAuthenticated: false,
  isUserSeller: false,
  isUserBuyer: false,
  appMessages: [],
};

const GlobalContext = createContext(APP_DEFAULT_STATE);

export const GlobalProvider = (props: any): JSX.Element => {
  const [appState, setAppState] = useState(APP_DEFAULT_STATE);

  const onLogin = (jwt: Jwt, isFromUi: boolean) => {
    const isUserAuthenticated = !!jwt && !!jwt.access_token;

    const decodedAccessToken = jwt_decode(
      jwt.access_token ?? ""
    ) as IAccessToken;

    setAppState({
      ...appState,
      isUserAuthenticated,
      isUserSeller:
        isUserAuthenticated && decodedAccessToken.role === Roles.SELLER,
      isUserBuyer:
        isUserAuthenticated && decodedAccessToken.role === Roles.BUYER,
      jwt,
      userId: decodedAccessToken.sub,
    });

    if (isFromUi) {
      localStorage.setItem(
        AppConfig.LS_KEY_ACCESS_TOKEN,
        jwt.access_token ?? ""
      );
    }

    HttpServices.setCommonHeader("Authorization", `Bearer ${jwt.access_token}`);
  };

  const onLogout = () => {
    setAppState({
      ...appState,
      isUserAuthenticated: false,
      isUserSeller: false,
      isUserBuyer: false,
      jwt: undefined,
      userId: undefined,
    });

    localStorage.removeItem(AppConfig.LS_KEY_ACCESS_TOKEN);
  };

  const showMessage = (msg: IToastMessage) => {
    setAppState((prevState) => {
      return {
        ...prevState,
        appMessages: [
          ...prevState.appMessages,
          { ...msg, delay: msg.delay ?? 3000 },
        ],
      };
    });
  };

  const showSuccess = (msg: string, autohide?: boolean) => {
    showMessage({
      title: "Success",
      variant: "success",
      description: msg,
      animation: true,
      autohide: autohide ?? true,
    } as IToastMessage);
  };

  const showError = (msg: string, autohide?: boolean) => {
    showMessage({
      title: "Error",
      variant: "danger",
      description: msg,
      animation: true,
      autohide: autohide ?? false,
    } as IToastMessage);
  };

  const showException = (exception: any, autohide?: boolean) => {
    let errorMessage: string = "";
    if (exception.isAxiosError) {
      const axiosError = exception as AxiosError;
      if (axiosError.response && axiosError.response.data) {
        const data = axiosError.response.data as any;
        if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `${data.statusCode}: ${data.error}`;
        }
      } else {
        errorMessage = axiosError.message;
      }
    } else {
      errorMessage = exception;
      console.error(exception);
    }

    showError(errorMessage, autohide);
  };

  const closeMessage = (msgIndex: number) => {
    if (msgIndex < 0) {
      return;
    }
    setAppState((prevState) => {
      return {
        ...prevState,
        appMessages: [
          ...prevState.appMessages.slice(0, msgIndex),
          ...prevState.appMessages.slice(msgIndex + 1),
        ],
      };
    });
  };

  setTimeout(() => {
    const item = localStorage.getItem(AppConfig.LS_KEY_ACCESS_TOKEN);
    if (item) {
      onLogin({ access_token: item }, false);
    }
  }, 0);

  return (
    <GlobalContext.Provider
      value={{
        isUserAuthenticated: appState.isUserAuthenticated,
        isUserSeller: appState.isUserSeller,
        isUserBuyer: appState.isUserBuyer,
        jwt: appState.jwt,
        userId: appState.userId,
        onLogin,
        onLogout,
        // App Messages:
        appMessages: appState.appMessages,
        showMessage,
        showSuccess,
        showError,
        showException,
        closeMessage,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
