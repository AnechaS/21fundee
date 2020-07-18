export const actionTypes = {
  AddressRequested: "ADDRESS_REQUESTED"
};

const initialState = [];

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.AddressRequested: {
      return action.payload;
    }

    default: {
      return state;
    }
  }
};

export const actions = {
  requestAddress: data => ({
    type: actionTypes.AddressRequested,
    payload: data
  })
};

// export function* saga() {
//   yield takeLatest(auth.actionTypes.Login, function* loginSaga() {
//     const { data } = yield getDistrictOfPeople();
// const districts = data.map(o => ({
//   province: o.province,
//   district: o.district
// }));

//     const provinces = uniqBy(districts, "province").map(o => ({
//       province: o.province
//     }));

//     yield put(
//       actions.requestAddress({
//         districts,
//         provinces
//       })
//     );
//   });
// }
