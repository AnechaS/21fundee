import { LOGIN_URL, ME_URL } from "../../app/crud/auth.crud";
import userTableMock from "./userTableMock";

export default function mockAuth(mock) {
  mock.onPost(LOGIN_URL).reply(({ data }) => {
    const { email, password } = JSON.parse(data);

    if (email && password) {
      const user = userTableMock.find(
        x =>
          x.email.toLowerCase() === email.toLowerCase() &&
          x.password === password
      );

      if (user) {
        return [200, { ...user, password: undefined }];
      }
    }

    return [400];
  });

  mock.onGet(ME_URL).reply(({ headers: { Authorization } }) => {
    // const accessToken =
    //   Authorization &&
    //   Authorization.startsWith("Bearer ") &&
    //   Authorization.slice("Bearer ".length);

    const accessToken = Authorization;
    if (accessToken) {
      const user = userTableMock.find(x => x.sessionToken === Authorization);

      if (user) {
        return [200, { ...user, password: undefined }];
      }
    }

    return [401];
  });
}
