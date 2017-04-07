import 'jest';
import Gino from '../index';

const shouldNotFire = () => {
  throw new Error('This callback should not get fired.');
};

describe('primitive ops', () => {
  it('should support set and get', () => {
    const store = new Gino();
    store.set('test', 'ok?');
    expect(store.get('test')).toBe('ok?');
  });

  it('should replace the existing value after setting', () => {
    const store = new Gino();
    store.set('test', 'ok?');
    store.set('test', 'of course');
    expect(store.get('test')).toBe('of course');
  });

  it('should support to update with a function', () => {
    const store = new Gino({
      test: 'ok?',
      test2: 'of course',
    });

    store.update(state => {
      expect(state).toEqual({test: 'ok?', test2: 'of course'});

      state.someItem = 1000;
      return { test: 123, test3: 234 };
    });

    expect(store.getAll()).toEqual({
      test: 123,
      test2: 'of course',
      test3: 234,
    });
  });

  it('should throw an error if update function returns nothing', () => {
    const store = new Gino();
    const run1 = () => {
      store.update(() => null);
    };

    const run2 = () => {
      // tslint:disable-next-line:no-empty
      store.update(() => {});
    };

    expect(run1).toThrow(/an object with updated values/);
    expect(run2).toThrow(/an object with updated values/);
  });

  it('should support getting all the values', () => {
    const store = new Gino();
    store.set('gino', 'me');
    store.set('me', {is: 'an object'});
    expect(store.getAll()).toEqual({
      gino: 'me',
      me: {
        is: 'an object',
      },
    });
  });

  it('should clone default values before setting it', () => {
    const defaults = { hah: 1010 };
    const store = new Gino(defaults);

    defaults.hah = 3000;
    expect(store.get('hah')).toEqual(1010);
  });

});

describe('subscribe', () => {
  it('should get the value when setting', done => {
    const store = new Gino({hah: 'hello'});

    store.subscribe(data => {
      expect(data).toEqual({hah: 'hello', ooo: 'hahh'});
      done();
    });
    store.set('ooo', 'hahh');
  });

  it('should not receive the current value when subscribe', done => {
    const store = new Gino({ hello: 12345 });

    store.set('ccy', 'kku');
    store.subscribe(shouldNotFire);

    setTimeout(done, 50);
  });

  it('should not receive updated after stopped', () => {
    const store = new Gino();
    const stop = store.subscribe(shouldNotFire);
    stop();
    store.set('ppd', 'kky');
  });
});
