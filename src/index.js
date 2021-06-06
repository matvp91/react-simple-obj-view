import React, { useLayoutEffect, useRef } from 'react';
import wcmatch from 'wildcard-match';

const MutationObserver =
  window.MutationObserver || window.WebKitMutationObserver;

const styles = {
  name: {
    color: 'rgb(0, 43, 54)',
    letterSpacing: 0.5
  },
  nameText: {
    color: 'inherit',
    backgroundColor: 'transparent',
    transition: 'background-color 750ms ease, color 250ms ease'
  },
  nameInArray: {
    color: 'rgb(108, 113, 196)',
    letterSpacing: 0.5
  },
  nameColon: {
    padding: '0px 3px',
    opacity: 0.65
  },
  enclosingSign: {
    fontWeight: 'bold'
  },
  'value-string': {
    color: 'rgb(203, 75, 22)'
  },
  'value-integer': {
    color: 'rgb(38, 139, 210)'
  },
  'value-float': {
    color: 'rgb(133, 153, 0)'
  },
  'value-nan': {
    color: 'rgb(211, 54, 130)',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3
  },
  'value-null': {
    color: 'rgb(211, 54, 130)',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3,
    textTransform: 'uppercase'
  },
  'value-undefined': {
    color: 'rgb(88, 110, 117)',
    fontSize: 11,
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3
  },
  'value-function': {
    color: 'rgb(0, 0, 120)',
    fontSize: 11,
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3
  },
  'value-boolean': {
    color: 'rgb(42, 161, 152)'
  },
  'value-redacted': {
    color: 'rgb(139, 128, 0)',
    fontSize: 11,
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3
  }
};

function getType(value) {
  let type = typeof value;

  // Transform edge cases.
  if (value === null) {
    type = 'null';
  } else if (value === undefined) {
    type = 'undefined';
  } else if (Array.isArray(value)) {
    type = 'array';
  }

  // Dig deeper when it is a number.
  if (type === 'number') {
    if (isNaN(value)) {
      type = 'nan';
    } else if (Number.isInteger(value)) {
      type = 'integer';
    } else {
      type = 'float';
    }
  }

  return type;
}

function createItems(obj, maxLevel, { mutateItem, level, inArray, parentId }) {
  return Object.entries(obj).map(([name, value]) => {
    const type = getType(value);

    const result = {
      key: `${name}.${level}`,
      id: parentId ? `${parentId}.${name}` : name,
      name,
      level,
      type,
      value: String(value),
      inArray
    };

    mutateItem(result);

    if (maxLevel > 0 && level > maxLevel) {
      return result;
    }

    if (type === 'object') {
      result.children = createItems(value, maxLevel, {
        mutateItem,
        level: level + 1,
        inArray: false,
        parentId: result.id
      });
    }

    if (type === 'array') {
      result.children = createItems(value, maxLevel, {
        mutateItem,
        level: level + 1,
        inArray: true,
        parentId: result.id
      });
    }

    return result;
  });
}

function valueComponent(item) {
  switch (item.type) {
    default:
      return <span style={styles[`value-${item.type}`]}>{item.value}</span>;

    case 'redacted':
      return <span style={styles['value-redacted']}>redacted</span>;

    case 'function':
      return <span style={styles['value-function']}>function</span>;

    case 'string':
      return <span style={styles['value-string']}>"{item.value}"</span>;

    case 'object':
      return (
        <span>
          <span style={styles.enclosingSign}>{'{'}</span>
          <Tree src={item.children} />
          <span style={styles.enclosingSign}>{'}'}</span>
        </span>
      );

    case 'array':
      return (
        <span>
          <span style={styles.enclosingSign}>{'['}</span>
          <Tree src={item.children} />
          <span style={styles.enclosingSign}>{']'}</span>
        </span>
      );
  }
}

function nameComponent(item) {
  if (item.inArray) {
    return (
      <span style={styles.nameInArray}>
        <span data-tree-item-name>{item.name}</span>
        <span style={styles.nameColon}>:</span>
      </span>
    );
  }
  return (
    <span style={styles.name}>
      <span data-tree-item-name style={styles.nameText}>
        {item.name}
      </span>
      <span style={styles.nameColon}>:</span>
    </span>
  );
}

function Tree({ src }) {
  return src.map(item => {
    const style = {
      marginBottom: 3
    };
    if (item.level) {
      style.paddingLeft = 15;
    }
    const childStyle = {
      display: 'inline-block'
    };
    return (
      <div key={item.key} style={style}>
        <div data-tree-item style={childStyle}>
          {nameComponent(item)}
          {valueComponent(item)}
        </div>
      </div>
    );
  });
}

export default function ObjViewer({ src, redactKeys = [], maxLevel = 0 }) {
  const ref = useRef();

  useLayoutEffect(() => {
    const handler = mutations => {
      mutations.forEach(mutation => {
        if (mutation.target === ref.current) {
          return;
        }

        let item;
        if (mutation.type === 'characterData') {
          const { parentElement } = mutation.target;
          const treeItem = parentElement.closest('[data-tree-item]');
          if (treeItem) {
            item = treeItem.querySelector('[data-tree-item-name]');
          }
        } else if (mutation.type === 'childList') {
          const treeItem = mutation.target.closest('[data-tree-item]');
          if (treeItem) {
            item = treeItem.querySelector('[data-tree-item-name]');
          }
        }

        if (!item) {
          return;
        }

        item.style.backgroundColor = 'rgba(	173, 216, 230)';
        item.style.transition = null;
        setTimeout(() => {
          if (!document.contains(item)) {
            return;
          }
          const { backgroundColor, transition } = styles.nameText;
          item.style.transition = transition;
          item.style.backgroundColor = backgroundColor;
        }, 100);
      });
      return mutations;
    };

    const observer = new MutationObserver(handler);
    observer.observe(ref.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const mutateItem = item => {
    const redacted = redactKeys.some(value => wcmatch(value)(item.id));
    if (redacted) {
      item.type = 'redacted';
    }
  };

  const items = createItems(src, maxLevel, {
    mutateItem,
    level: 0,
    inArray: false
  });
  return (
    <div ref={ref}>
      <Tree src={items} />
    </div>
  );
}
