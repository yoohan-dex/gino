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

    expect(run1).toThrowError(/an object with updated values/);
    expect(run2).toThrowError(/an object with updated values/);
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

  it('should fire subsrictions only once when updated', () => {
    const store = new Gino();
    let count = 0;
      store.subscribe((data) => {
        expect(data).toEqual({ abc: 10, bbc: 20 });
        count += 1;
      });
      store.update(data => ({ abc: 10, bbc: 20}));
      expect(count).toBe(1);
  });
});

describe('watch', () => {
  it('should receive updated for a given key', () => {
    const store = new Gino();
    store.set('xxx', 1);
    const gotItems = [];

    store.watch('xxx', result => {
      gotItems.push(result);
    });

    store.set('xxx', 10);
    store.set('xxx', 20);

    expect(gotItems).toEqual([10, 20]);
  });

  it('should not receive updates for some other key', () => {
    const store = new Gino();
    const gotItems = [];

    store.watch('xxx', result => {
      gotItems.push(result);
    });

    store.set('yyy', 10);
    store.set('xxx', 20);
    expect(gotItems).toEqual([20]);
  });

  it('should receive manual firings for a key', () => {
    const store = new Gino();
    const gotItems = [];

    store.watch('xxx', result => {
      gotItems.push(result);
    });

    store.set('xxx', 10);
    store.fire('xxx', 20);

    expect(gotItems).toEqual([10, 20]);
    expect(store.get('xxx')).toBe(10);
  });

  it('should not receive updates after stopped', () => {
    const store = new Gino();
    const stop = store.watch('xxx', shouldNotFire);
    stop();
    store.set('xxx', 123);
  });

  it('should receive updates if the given key meets the expected', () => {
    const store = new Gino();
    const gotItems = [];

    store.watchFor('xxx', 123, result => {
      gotItems.push(result);
    });

    store.set('xxx', 321);
    store.set('xxx', 'hello');
    store.set('xxx', 123);
    expect(gotItems).toEqual([123]);
  });

  it('should not receive updates if the given key does not meets the expected', () => {
    const store = new Gino();
    store.set('xxx', 1);

    store.watchFor('xxx', 20, shouldNotFire);
    store.set('xxx', 10);
  });

  it('should receive manual firings for a key', () => {
    const store = new Gino();
    store.set('xxx', 1);
    const gotItems = [];

    store.watchFor('xxx', 40, (result) => {
      gotItems.push(result);
    });

    store.set('xxx', 10);
    store.fire('xxx', 40);

    expect(gotItems).toEqual([40]);
    expect(store.get('xxx')).toEqual(10);
  });

  it('should not receive updates after stopped', () => {
    const store = new Gino();
    const stop = store.watchFor('xxx', 123, shouldNotFire);
    stop();
    store.set('xxx', 123);
  });
});

describe('registerAPI', () => {
  it('should add new APIs to the store', () => {
    const store = new Gino({ lights: false });
    store.registerAPI('toggle', (s, key) => {
      s.set(key, !store.get(key));
      return s.get(key);
    });

    expect(store.toggle('lights')).toBe(true);
  });

  it('should not override existing APIs', () => {
    const store = new Gino({ lights: false });
    const run = () => {
      store.registerAPI('set', () => null);
    };

    expect(run).toThrowError(/Cannot add an API for the existing API: \[ set \]/);
  });
});
