import 'jest';
import Lynx from '../index';

describe('static walker', () => {
  type Tree = {
    id?: number,
    children?: Tree | Tree[],
    child?: Tree,
    value?: string,
  };
  const treeA = {
    id: 1,
    children: [{ id: 2 }, { id: 3 }],
    child: { id: 4 },
    value: '*test passes*',
  };

  const result = [
    ['children', [{ id: 2 }, { id: 3 }]],
    ['child', { id: 4 }],
  ];
  it('should accept a walking function', () => {
    const walker = Lynx.walker<Tree>((node, walk) => {
      if (node.children) {
        walk('children');
      }
      if (node.child) {
        walk('child');
      }
    });

    expect(walker(treeA)).toEqual(result);
  });
  it('should accept an array', () => {
    const subnodes = ['children', 'child'];
    const walker = Lynx.walker<Tree>(subnodes);
    expect(walker(treeA)).toEqual(result);
  });

  it('should do nested walking properly', () => {
    const tree = {
      attrs: { left: { right: { node: true } } },
    };
    const walker = Lynx.walker<any>((node, walk) => {
      if (node.attrs.left.right) {
        walk('attrs.left.right');
      }
    });
    expect(walker(tree)).toEqual([
      ['attrs.left.right', { node: true }],
    ]);
  });
});

describe('static walk', () => {
  type Tree = {
    op?: string,
    left?: Tree,
    right?: Tree,
    value?: any,
  };
  const treeA = {
    op: '+',
    left: { value: 8 },
    right: {
      op: '/',
      left: { value: 20 },
      right: { value: 4 },
    },
  };
  const treeB = [4, '*', 5, '+', [12, '-', 8]];

  it('should walk the tree as described by the walkFn?', () => {
    const result = Lynx.walk<Tree>(treeA, (node, walk) => {
      if (node.op) {
        return '(' + walk(node.left) + node.op + walk(node.right) + ')';
      }
      return node.value;
    });
    expect(result).toBe('(8+(20/4))');
  });

  it('should pass extra arguments from the walkFn to the next node?', () => {
    const history = Lynx.walk<Tree>(treeA, (node, walk, count) => {
      if (node.left && node.right) {
        return [count].concat(
          walk(node.left, count + 1),
          walk(node.right, count + 10));
      } else {
        return count + 5;
      }
    }, 10);

    expect(history).toEqual([10, 16, 20, 26, 35]);
  });

  it('should call the walkFn on multiple sibling nodes individually', () => {
    const result = Lynx.walk<(string|number|(string|number)[])[]>(treeB, (node, walk) => {
      if (Array.isArray(node)) {
        return '(' + walk(node).join(' ') + ')';
      }
      return node;
    }).join(' ');
    expect(result).toEqual('4 * 5 + (12 - 8)');
  });

  it('should if no tree is provided return a function that takes a tree', () => {
    const walker = Lynx.walk<Tree>((node, walk) => {
      if (node.op) {
        return '(' + walk(node.left) + node.op + walk(node.right) + ')';
      }
      return node.value;
    });
    expect(walker(treeA)).toBe('(8+(20/4))');
  });
});

describe('instance of Lynx', () => {
  type Tree = {
    id?: string,
    children?: Tree[],
  };
  const treeA = {
    id: 'A',
    children: [{
      id: 'B',
      children: [{ id: 'D' }, { id: 'E' }],
    }, {
      id: 'C',
      children: [{ id: 'F' }, { id: 'G' }],
    }],
  };
  const treeASize = 7;
  const treeAIds = 'ABCDEFG'.split('');
  const walkerA = new Lynx<Tree>(['children']);

  describe('walker(tree) tree', () => {
    const treeB = walkerA.walker(treeA);
    expect(treeB).toEqual([
      ['children', [{
        children: [
          {id: 'D'},
          {id: 'E'},
        ],
        id: 'B',
      }, {
        children: [
          {id: 'F'},
          {id: 'G'},
        ],
        id: 'C',
      }]],
    ]);
  });

  describe('map(tree, transform) tree', () => {
    it('should return a new tree of results of func', () => {
      const treeB = walkerA.map(treeA, (node) => {
        node.id += node.id;
        return node;
      });

      const treeC = {
        id: 'AA',
        children: [{
          id: 'BB',
          children: [{ id: 'DD' }, { id: 'EE' }],
        }, {
          id: 'CC',
          children: [{ id: 'FF' }, { id: 'GG' }],
        }],
      };

      expect(treeB).toEqual(treeC);

    });
  });
//   describe('filter(tree, predicate) tree', () => {
//     it('should return a new tree without failing nodes', () => {
//       const treeB = walkerA.filter(treeA, node => {
//         return node.id !== 'C';
//       });

//       const treeC = {
//         id: 'A',
//         children: [{
//           id: 'B',
//           children: [{id: 'D'}, {id: 'E'}],
//         }],
//       };

//       expect(treeB).toEqual(treeC);
//     });
//     it('should return undefind if have no the exact node', () => {
//       const treeB = walkerA.filter(treeA.children[1], node => {
//         return node.id !== 'C';
//       });

//       expect(treeB).toBe(undefined);
//     });
//   });

//   describe('find(tree, properties) tree', () => {
//     it('should return a new tree without failing node', () => {
//       const treeB = walkerA.find(treeA, {id: 'A'});
//       const treeC = {
//         id: 'A',
//         children: [],
//       };

//       expect(treeB).toEqual(treeC);
//     });
//     it('should return undefind if it have no the exact node', () => {
//       const treeB = walkerA.find(treeA, {id: 'H'});
//       expect(treeB).toBe(undefined);
//     });
//   });
//   describe('bredthIterator(tree) Iterator', () => {
//     it('should return an Iterator with a next function', () => {
//       const iter = walkerA.depthIterator(treeA);
//       expect(typeof iter.next).toBe('function');
//     });

//     it('should return the nodes in breadth-first order', () => {
//       const iter = walkerA.depthIterator(treeA);
//       let ids = '';
//       while (true) {
//         const res = iter.next();
//         if (res.done) {
//           break;
//         }
//         ids += res.value.id;
//       }
//       expect(ids).toBe('ABCDEFG');
//     });
//   });
// });

});
