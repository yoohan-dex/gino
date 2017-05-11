import { LOCATION_STATIC } from 'tslint/lib/rules/completedDocsRule';
import * as utils from './utils';
import { Obj } from './utils';

export type ProcessorWithRest<U> = (node: U, walk: Walk<U>, ...rest: any[]) => any;
export type Processor<U> = (node: U, walk: Walk<U>) => any;
export type Walk<U> = (node: U, ...rest: any[]) => any[];
const isArray = (arr: any): arr is any[] =>  Array.isArray(arr);

function walkBy<T>
  (func: ProcessorWithRest<T>, ...rest: any[]):
  Walk<T> {
    const walk = (node: T|T[], ...rest: any[]): any[] => {
      if (Array.isArray(node)) {
        const nodes: any[] = [];
        node.forEach(n => {
          nodes.push(func(n, walk, ...rest));
        });
        return nodes;
      }
      return func(node, walk, ...rest);
    };
    return walk;
  }

export default class Lynx<T> {
  public walker = Lynx.walker(this.processor);
  /**
   * Take a function accepts a node and walk(node) callback and return a function accept a tree waiting for parsed.
   * @param func a processor function to deal with the node comming
   * @param rest some extra args you can pass through the func every loop
   */
  public static walk<U>(func: ProcessorWithRest<U>, ...rest: any[]): any;
  /**
   * Takes a tree and a function that accepts a node and walk(node) callback.
   * @param tree the target tree
   * @param func  a processor function to deal with the node comming
   * @param rest some extra args you can pass through the func every loop
   */
  public static walk<U>(tree: U, func?: ProcessorWithRest<U>, ...rest: any[]): any;
  public static walk<U>(tree: any, func?: any, ...rest: any[]): any {
    if (tree && typeof tree !== 'function') {
      return walkBy<U>(func)(tree, ...rest);
    }
    return walkBy<U>(<ProcessorWithRest<U>>tree, func, ...rest);
  }

  public static walker<U>(processor: string[]|Processor<U>) {
    let _walker: any;
    if (isArray(processor)) {
      _walker = (node: any, walk: Function) => {
        processor.forEach(key => {
          if (utils.deepHas(node, key)) {
            walk(key);
          }
        });
      };
    } else {
      _walker = processor;
    }
    function walker(tree: U): [[string, U]] {
      let steps: any[] = [];
      _walker(tree, (prop: string, node: U) => {
        if (node === undefined) {
          steps.push([prop, utils.deepGet(tree, prop)]);
        } else {
          steps.push([prop, node]);
        }
      });
      return <[[string, U]]>steps;
    }
    return walker;
  }
  constructor(public processor: Processor<T>|string[]) {}
  public map(node: T, func: (tree: T) => any): T {
    const steps = this.walker(node);
    const res: T = func(Object.assign({}, node));
    steps.forEach((tuple) => {
      let kid: any;
      const [prop, child] = tuple;
      if (isArray(child)) {
        kid = [];
        child.forEach((c: any) => {
          kid.push(this.map(c, func));
        });
      } else {
        kid = this.map(child, func);
      }
      utils.deepSet(res, prop, kid);
    });
    return res;
  }

  public filter(node: T, func: (tree: T) => boolean): T|undefined {
    if (!func(node)) {
      return undefined;
    }
    const steps = this.walker(node);
    const res: T = Object.assign({}, node);
    steps.forEach(tuple => {
      let kid: any;
      const [prop, child] = tuple;
      if (isArray(child)) {
        kid = [];
        child.forEach(c => {
          if (this.filter(c, func)) {
            kid.push(c);
          }
        });
      } else if (this.filter(child, func)) {
        kid = child;
      }
      utils.deepSet(res, prop, kid);
    });
    return res;
  }

  public where(tree: T, obj: Object) {
    return this.filter(node, utils.whereFilter(obj));
  }

  public forEach(tree: T, func: )
}
