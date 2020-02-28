import moment from "moment";
import { isEmpty } from "lodash";
import { actions } from "../../app/store/ducks/auth.duck";
import { REQUEST_TOKEN_INTERVAL_ADVANCE } from "./constants";

export function removeCSSClass(ele, cls) {
  const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
  ele.className = ele.className.replace(reg, " ");
}

export function addCSSClass(ele, cls) {
  ele.classList.add(cls);
}

export const toAbsoluteUrl = pathname => process.env.PUBLIC_URL + pathname;

export function setupAxios(axios, store) {
  axios.interceptors.request.use(
    async config => {
      const { authToken, refreshToken, expiresAt } = store.getState().auth;
      let transformAuthToken = authToken;

      // refresh token when expires
      if (
        !isEmpty(refreshToken) &&
        !isEmpty(expiresAt) &&
        moment(expiresAt)
          .subtract(REQUEST_TOKEN_INTERVAL_ADVANCE, "minutes")
          .isBefore()
      ) {
        try {
          console.log('REFRASH_TOKEN_BEFORE_REQUEST');

          // request to refresh token
          const response = await fetch("/auth/refresh-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken })
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          const json = await response.json();
          if (typeof json !== "undefined") {
            // dispatch refresh token
            store.dispatch(actions.requestToken(json));

            transformAuthToken = json.accessToken;
          }
        } catch (error) {
          if (error.message === "Unauthorized") {
            // dispatch logout when request response status unauthorized
            setTimeout(() => {
              store.dispatch(actions.logout());
            }, 250);
            // Operation cancel request
            throw new axios.Cancel("Unauthorized");
          }
        }
      }

      // set access token in headers request when auth
      if (authToken) {
        config.headers.Authorization = `Bearer ${transformAuthToken}`;
      }
      
      return config;
    },
    err => Promise.reject(err)
  );

  axios.interceptors.response.use(
    response => response,
    async error => {
      const {
        response: { status, data },
        config
      } = error;
      const { refreshToken } = store.getState().auth;

      if (
        status === 401 &&
        Object.hasOwnProperty.call(data, "message") &&
        data.message === "jwt expired" &&
        !isEmpty(refreshToken) &&
        config.__isRetryRequest
      ) {
        console.log('REFRASH_TOKEN_ARTER_REQUEST');

        const response = await fetch("/auth/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ refreshToken })
        });
        if (response.ok) {
          config.__isRetryRequest = true;

          const json = await response.json();

          // dispatch refresh token
          store.dispatch(actions.requestToken(json));

          // replace the expired token and retry
          config.headers.Authorization = "Bearer " + json.accessToken;
          return axios(config);
        }
      }

      // dispatch logout where unauthorized
      if (status === 401) {
        setTimeout(() => {
          store.dispatch(actions.logout());
        }, 250);
      }

      return Promise.reject(error);
    }
  );
}

/*  removeStorage: removes a key from localStorage and its sibling expiracy key
    params:
        key <string>     : localStorage key to remove
    returns:
        <boolean> : telling if operation succeeded
 */
export function removeStorage(key) {
  try {
    localStorage.setItem(key, "");
    localStorage.setItem(key + "_expiresIn", "");
  } catch (e) {
    console.log(
      "removeStorage: Error removing key [" +
        key +
        "] from localStorage: " +
        JSON.stringify(e)
    );
    return false;
  }
  return true;
}

/*  getStorage: retrieves a key from localStorage previously set with setStorage().
    params:
        key <string> : localStorage key
    returns:
        <string> : value of localStorage key
        null : in case of expired key or failure
 */
export function getStorage(key) {
  const now = Date.now(); //epoch time, lets deal only with integer
  // set expiration for storage
  let expiresIn = localStorage.getItem(key + "_expiresIn");
  if (expiresIn === undefined || expiresIn === null) {
    expiresIn = 0;
  }

  expiresIn = Math.abs(expiresIn);
  if (expiresIn < now) {
    // Expired
    removeStorage(key);
    return null;
  } else {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (e) {
      console.log(
        "getStorage: Error reading key [" +
          key +
          "] from localStorage: " +
          JSON.stringify(e)
      );
      return null;
    }
  }
}
/*  setStorage: writes a key into localStorage setting a expire time
    params:
        key <string>     : localStorage key
        value <string>   : localStorage value
        expires <number> : number of seconds from now to expire the key
    returns:
        <boolean> : telling if operation succeeded
 */
export function setStorage(key, value, expires) {
  if (expires === undefined || expires === null) {
    expires = 24 * 60 * 60; // default: seconds for 1 day
  }

  const now = Date.now(); //millisecs since epoch time, lets deal only with integer
  const schedule = now + expires * 1000;
  try {
    localStorage.setItem(key, value);
    localStorage.setItem(key + "_expiresIn", schedule);
  } catch (e) {
    console.log(
      "setStorage: Error setting key [" +
        key +
        "] in localStorage: " +
        JSON.stringify(e)
    );
    return false;
  }
  return true;
}
