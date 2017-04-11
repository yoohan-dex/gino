import 'jest';
import { createApp } from '../';
import * as indexExports from '../';
import * as simpleSimpleDiExports from 'react-simple-di';
import * as reactKomposerExports from 'react-komposer';

describe('Module', () => {
  describe('createApp', async () => {
    it('should create app with provided args', () => {
      const context = {aa: 10, bb: 20};
      const app = createApp(context);
      expect(app.context).toEqual(context);
    });

    it('should have useDeps from react-simple-di', () => {
      expect(indexExports.useDeps).toEqual(simpleSimpleDiExports.useDeps);
    });

    it('should have all functions from react-komposer', () => {
      const fnNames = [
        'compose', 'composeWithPromise', 'composeWithTracker',
        'composeWithObservable', 'composeAll', 'disable',
      ];

      fnNames.forEach(fnName => {
        const reactKomposerFn = reactKomposerExports[fnName];
        const indexFN = indexExports[fnName];
        expect(reactKomposerFn).toEqual(indexFN);
      });
    });
  });
});
