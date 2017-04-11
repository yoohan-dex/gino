import 'jest';
import App from '../app';

const noop = () => null;
const fullParameterModule = {
  routes() {return null; },
  load() {return null; },
  actions: {aa: 10},
  loaded: false,
};

const withoutActionMoudle = {
  routes() {return null; },
  load() {return null; },
};
describe('App', () => {
  describe('loadModule', () => {
    it('should fail if initialized', () => {
      const app = new App({});
      app.init();
      expect(app.loadModule.bind(app)).toThrow(/already initialized/);
    });

    it('should merge actions with app wide global actions', () => {
      const app = new App({});
      app.actions = {bb: 10};

      app.loadModule(fullParameterModule);
      expect(app.actions).toEqual({bb: 10, aa: 10});
    });

    it('should merge actions even actions is an empty field', () => {
      const app = new App({});
      app.actions = {bb: 10};
      app.loadModule(withoutActionMoudle);
      expect(app.actions).toEqual({bb: 10});
    });
  });
  describe('has module.load', () => {
    it('should call module.load with context and actions', done => {
      const context = {aa: 10};
      const app = new App(context);
      app.actions = {
        hello: {
          hey(c, a) {
            expect(c).toEqual(context);
            expect(a).toBe(20);
            done();
          },
        },
      };

      const module = {
          routes() {return null; },
          load(c, actions) {
            expect(c).toEqual(context);
            actions.hello.hey(20);
          },
        };
      app.loadModule(module);
    });

    it('should mark the module as loaded', () => {
      const app = new App({});
      app.loadModule(fullParameterModule);
      expect(fullParameterModule.loaded).toEqual(true);
    });

    describe('init', () => {
      it('should call all routes functions as the load order', () => {
        const calledRoutes = [];
        const genRoute = index => {
          return () => calledRoutes.push(index);
        };
        const module1 = {
          load: noop,
          routes: genRoute(1),
        };
        const module2 = {
          load: noop,
          routes: genRoute(2),
        };
        const app = new App({});
        app.loadModule(module1);
        app.loadModule(module2);
        app.init();
        expect(calledRoutes).toEqual([ 1, 2 ]);
      });
    });
  });
});
