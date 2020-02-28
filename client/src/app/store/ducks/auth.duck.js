import { persistReducer, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { put, takeLatest } from "redux-saga/effects";
import { getUserByToken } from "../../crud/auth.crud";
import * as routerHelpers from "../../router/RouterHelpers";
import { toAbsoluteUrl } from "../../../_metronic/utils/utils";

export const actionTypes = {
  Login: "[Login] Action",
  Logout: "[Logout] Action",
  Register: "[Register] Action",
  RefreshToken: "[Refresh Token] Action",
  UserRequested: "[Request User] Action",
  UserLoaded: "[Load User] Auth API"
};

const initialAuthState = {
  user: undefined,
  authToken: undefined,
  refreshToken: undefined,
  expiresAt: ""
};

export const reducer = persistReducer(
  {
    storage,
    key: "auth",
    whitelist: ["user", "authToken", "refreshToken", "expiresAt"]
  },
  (state = initialAuthState, action) => {

    switch (action.type) {
      case actionTypes.Login: {
        const { token, user } = action.payload;

        return {
          authToken: token.accessToken,
          expiresAt: token.expiresIn,
          refreshToken: token.refreshToken,
          user: {
            pic: toAbsoluteUrl("/media/users/300_25.jpg"),
            fullname: user.username,
            occupation: "CEO",
            companyName: "Keenthemes",
            phone: "456669067890",
            address: {
              addressLine: "L-12-20 Vertex, Cybersquare",
              city: "San Francisco",
              state: "California",
              postCode: "45000"
            },
            socialNetworks: {
              linkedIn: "https://linkedin.com/admin",
              facebook: "https://facebook.com/admin",
              twitter: "https://twitter.com/admin",
              instagram: "https://instagram.com/admin"
            },
            ...user
          }
        };
      }

      case actionTypes.Register: {
        const { authToken } = action.payload;

        return { authToken, user: undefined };
      }

      case actionTypes.Logout: {
        routerHelpers.forgotLastLocation();
        return initialAuthState;
      }

      case actionTypes.UserLoaded: {
        const { user } = action.payload;

        return { 
          ...state, 
          user: {
            pic: toAbsoluteUrl("/media/users/300_25.jpg"),
            fullname: user.username,
            occupation: "CEO",
            companyName: "Keenthemes",
            phone: "456669067890",
            address: {
              addressLine: "L-12-20 Vertex, Cybersquare",
              city: "San Francisco",
              state: "California",
              postCode: "45000"
            },
            socialNetworks: {
              linkedIn: "https://linkedin.com/admin",
              facebook: "https://facebook.com/admin",
              twitter: "https://twitter.com/admin",
              instagram: "https://instagram.com/admin"
            },
            ...user
          }
        };
      }

      case actionTypes.RefreshToken: {
        const { token } = action.payload;
        return {
          ...state,
          authToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresIn
        };
      }

      default: {
        return state;
      }
    }
  }
);

export const actions = {
  login: (token, user) => ({
    type: actionTypes.Login,
    payload: { token, user }
  }),
  requestToken: token => ({
    type: actionTypes.RefreshToken,
    payload: { token }
  }),
  register: authToken => ({
    type: actionTypes.Register,
    payload: { authToken }
  }),
  logout: () => ({ type: actionTypes.Logout }),
  requestUser: user => ({ type: actionTypes.UserRequested, payload: { user } }),
  fulfillUser: user => ({ type: actionTypes.UserLoaded, payload: { user } })
};

export function* saga() {
  // init page
  yield takeLatest(REHYDRATE, function* userCurrent(action) {
    if (action.key === "auth" && typeof action.payload.user !== "undefined") {
      yield put(actions.requestUser());
    }
  });

  // action login
  // yield takeLatest(actionTypes.Login, function* loginSaga() {
  //   yield put(actions.requestUser());
  // });

  yield takeLatest(actionTypes.Register, function* registerSaga() {
    yield put(actions.requestUser());
  });

  yield takeLatest(actionTypes.UserRequested, function*() {
    const { data: user } = yield getUserByToken();

    yield put(actions.fulfillUser(user));
  });
}
