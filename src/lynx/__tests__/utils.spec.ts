import * as utils from '../utils';
import 'jest';

const foo = {
      bar: {
        foo: 123,
      },
    };

describe('deepHas', () => {
  it('should return true if there is', () => {
    expect(utils.deepHas(foo, 'bar.foo')).toEqual(true);
    expect(utils.deepHas(foo, 'bar.foo.bar.foo')).toEqual(false);
  });
});

describe('deepGet', () => {
  it('should return the exact value', () => {
    expect(utils.deepGet(foo, 'bar')).toEqual({foo: 123});
    expect(utils.deepGet(foo, 'bar.foo')).toBe(123);
  });
});

describe('deepSet', () => {
  it('should set the value', () => {
    const voo = {
      bar: {
        foo: 123,
      },
    };
    utils.deepSet(voo, 'bar.foo', 345);
    expect(voo).toEqual({ bar: { foo: 345}});
  });
});

describe('whereFilter', () => {
  it('should filter out the exact key', () => {
    const voo = {
      bar: {
        foo: 123,
      },
    };
    const yoo = {
      bar: {
        foo: 345,
      },
    };
    expect(utils.whereFilter(yoo)(voo)).toBe(false);
    expect(utils.whereFilter(foo)(yoo)).toBe(false);
    expect(utils.whereFilter(voo)(voo)).toBe(true);
  });
});
