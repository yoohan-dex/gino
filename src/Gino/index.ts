import * as Immutable from 'immutable';


export interface DefaultState {
  [prop: string]: any;
}

export type SubsribeFunctoins = Function[];
export type WatchCallbacks = {
  [prop: string]: SubsribeFunctoins,
};

export default class Gino {
  public data: Immutable.Map<string, any>;
  public callbacks: SubsribeFunctoins;
  public watchCallbacks: WatchCallbacks;


  constructor(defaultState: DefaultState = {}) {
    this.data = Immutable.Map(defaultState);
    this.callbacks = [];
    this.watchCallbacks = {};
  }

  public get(key: string) {
    const value = this.data.get(key) as {toJS: () => any};
    if (value === null || value === undefined) {
      return value;
    }

    return value.toJS ? value.toJS() : value;
  }

  public getAll() {
    return this.data.toJS();
  }

  public update(fn: Function) {
    const currentState = this.data.toJS();
    const newFields = fn(currentState);
    if (newFields === null || newFields === undefined) {
      throw new Error('You must provide an object with updated values for Gino.set(fn)');
    }
    Object.keys(newFields).forEach((key) => {
      this._set(key, newFields[key]);
    });
    this.fireSubscriptions();
  }


  public subscribe(cb: Function) {
    this.callbacks.push(cb);
    let stopped = false;

    const stop = () => {
      if (stopped) {
        return;
      }
      const index = this.callbacks.indexOf(cb);
      this.callbacks.splice(index, 1);
      stopped = true;
    };
    return stop;
  }

  public fire(key: string, value: any) {
    const watchCallbacks = this.watchCallbacks[key] || [];
    watchCallbacks.forEach(cb => {
      cb(value);
    });
  }

  public set(key: string, value: any) {
    this._set(key, value);
    this.fireSubscriptions();
  }

  public watch(key: string, callback: Function) {
    if (!this.watchCallbacks[key]) {
      this.watchCallbacks[key] = [];
    }

    const callbacks = this.watchCallbacks[key];
    callbacks.push(callback);

    let stopped = false;
    function stop() {
      if (stopped) {
        return;
      }

      const index = callbacks.indexOf(callback);
      callbacks.splice(index, 1);
      stopped = true;
    }
    return stop;
  }

  public watchFor(key: string, expectedValue: any, callback: Function) {
    const checkAndCallback = (value: any) => {
      if (value === expectedValue) {
        callback(value);
      }
    };

    return this.watch(key, checkAndCallback);
  }

  public registerAPI(method: string, fn: Function) {
    if (Reflect.has(this, method)) {
      throw new Error(`Cannot add an API for the existing API: [ ${method} ] .`);
    }
    Reflect.defineProperty(this, method, {
      value: (...args: any[]) => fn(this, args),
    });
  }

  private _set(key: string, value: any) {
    this.data = this.data.set(key, Immutable.fromJS(value));
    this.fire(key, value);
  }
  private fireSubscriptions() {
    this.callbacks.forEach(cb => {
      cb(this.getAll());
    });
  }

}
