import { Context } from 'vm';
import { injectDeps } from 'react-simple-di';
import { ReactElement, StatelessComponent } from 'react';

export type Comp = ReactElement<any> | StatelessComponent<any>;

export interface Module {
  loaded?: boolean;
  actions?: Object;
  routes(): void;
  load(context: ReceiveObject, boundedActions: ReceiveObject): void;
}

export interface ReceiveObject {
  [key: string]: any;
}

export default class App {
  public actions = {};
  private routeFns: Function[] = [];
  private initialized = false;


  constructor(public context: ReceiveObject) {
  }

  /**
   * TODO:  change the binding position at the first loop
   */
  public loadModule(module: Module) {
    this.checkForInit();
    this.routeFns.push(module.routes);
    const actions = module.actions || {};

    this.actions = {
      ...this.actions,
      ...actions,
    };

    const boundedActions = this.bindContext(this.actions);
    module.load(this.context, boundedActions);

    module.loaded = true;
  }

  public init() {
    this.checkForInit();

    for (const routeFn of this.routeFns) {
      const inject = (comp: Comp) =>
        injectDeps(this.context, this.actions)(comp);

      routeFn(inject, this.context, this.actions);
    }

    this.routeFns = [];
    this.initialized = true;
  }


  private bindContext(_actions: ReceiveObject) {
    const actions: ReceiveObject = {};
    for (let key in _actions) {
      if (_actions.hasOwnProperty(key)) {
        const actionMap = _actions[key];
        const newActionMap: ReceiveObject = {};
        for (let actionName in actionMap) {
          if (actionMap.hasOwnProperty(actionName)) {
            newActionMap[actionName] =
              actionMap[actionName].bind(null, this.context);
          }
        }
        actions[key] = newActionMap;
      }
    }
    return actions;
  }

  private checkForInit() {
    if (this.initialized) {
      const message = `App is already initialized`;
      throw new Error(message);
    }
  }
}
