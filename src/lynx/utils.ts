export interface Obj extends Object {
  [prop: string]: any;
}

// const deepCopy = (obj: Object, notKeys: string[]) => {
//   const res = {};
//   Object.keys(obj).forEach(prop => {
//     // tslint:disable-next-line:no-bitwise
//     if (obj.hasOwnProperty(prop) && !~notKeys.indexOf(prop)) {
//       const val = obj[prop];
//       if (typeof val === 'object') {
//         const head = `${prop}.`;
//         res[prop] = deepCopy(val, notKeys.reduce(p, c) => {
//           if (!c.indexOf(head))
//         })
//       }
//     }
//   })
// }
const deepCopy = (obj: Obj, notKeys: string[]) => {
  let res: Obj = {};
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    // tslint:disable-next-line:no-bitwise
    if (typeof val === 'object' && !~notKeys.indexOf(key)) {
      const head = `${key}.`;
      res[key] = deepCopy(val, notKeys.reduce((pre, curr) => {
        if (!curr.indexOf(head)) {
          pre.push(curr.slice(head.length));
        }
        return pre;
      }, []));
    } else {
      res[key] = val;
    }
  });
  return res;
};
const deepHas = (obj: Obj, key: string): boolean => {
  const props = key.split('.');
  if (!obj) {
    return false;
  }
  const prop = props.shift();
  return prop ? deepHas(obj[prop], props.join('.')) : true;
};

const deepGet = (obj: Obj, key: string): any => {
  const props = key.split('.');
  const prop = props.shift();
  if (!prop) {
    return obj;
  }
  return deepGet(obj[prop], props.join('.'));
};
const deepSet = (obj: Obj, key: string, value: any) => {
  const levels = key.split('.');
  const end = levels.length - 1;
    for (let i = 0; i < end; i++) {
      obj = obj[levels[i]];
    }
  obj[levels[end]] = value;
};

const whereFilter = (obj: Obj): (node: Obj) => boolean =>
  node => {
    let flag;
    Object.keys(obj).forEach(prop => {
      if (obj[prop] !== node[prop]) {
        flag = false;
      }
    });
    return flag === undefined ? true : flag;
  };

export {
  deepHas,
  deepSet,
  deepGet,
  whereFilter,
};
