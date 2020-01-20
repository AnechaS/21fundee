const removeRequestBodyWithNull = require('../../utils/removeRequestBodyWithNull');

it('should return object', () => {
  const body = { 
    a: undefined, 
    b: 2, 
    c: 4, 
    d: NaN,
    e: null, 
    f: false, 
    g: '', 
    h: 0,
    i: 'null'
  };
  expect(removeRequestBodyWithNull(body)).toEqual({
    b: 2,
    c: 4,
    f: false,
    h: 0,
  });
});