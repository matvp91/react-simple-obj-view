import React from 'react';

const styles = {
  name: {
    color: 'rgb(0, 43, 54)',
    letterSpacing: 0.5,
  },
  nameInArray: {
    color: 'rgb(108, 113, 196)',
    letterSpacing: 0.5,
  },
  nameColon: {
    padding: '0px 3px',
    opacity: 0.65,
  },
  enclosingSign: {
    fontWeight: 'bold',
  },
  'value-string': {
    color: 'rgb(203, 75, 22)',
  },
  'value-integer': {
    color: 'rgb(38, 139, 210)',
  },
  'value-float': {
    color: 'rgb(133, 153, 0)',
  },
  'value-nan': {
    color: 'rgb(211, 54, 130)',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3,
  },
  'value-null': {
    color: 'rgb(211, 54, 130)',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  'value-undefined': {
    color: 'rgb(88, 110, 117)',
    fontSize: 11,
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3,
  },
  'value-function': {
    color: 'rgb(0, 0, 120)',
    fontSize: 11,
    backgroundColor: 'rgb(235, 235, 235)',
    padding: '1px 2px',
    borderRadius: 3,
  },
  'value-boolean': {
    color: 'rgb(42, 161, 152)',
  },
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

function createItems(obj, { level = 0, inArray = false } = {}) {
  return Object.entries(obj).map(([name, value]) => {
    const type = getType(value);

    const result = {
      key: `${name}.${level}`,
      name,
      level,
      type,
      value: String(value),
      inArray,
    };

    if (type === 'object') {
      result.children = createItems(value, {
        level: level + 1,
      });
    }

    if (type === 'array') {
      result.children = createItems(value, {
        level: level + 1,
        inArray: true,
      });
    }

    return result;
  });
}

function valueComponent(item) {
  switch (item.type) {
    default:
      return <span style={styles[`value-${item.type}`]}>{item.value}</span>;

    case 'function':
      return <span style={styles[`value-${item.type}`]}>function</span>;

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
        {item.name}
        <span style={styles.nameColon}>:</span>
      </span>
    );
  }
  return (
    <span style={styles.name}>
      {item.name}
      <span style={styles.nameColon}>:</span>
    </span>
  );
}

function Tree({ src }) {
  return src.map(item => {
    const style = {
      marginBottom: 3,
    };
    if (!!item.level) {
      style.paddingLeft = 15;
    }
    return (
      <div key={item.key} style={style}>
        {nameComponent(item)}
        {valueComponent(item)}
      </div>
    );
  });
}

export default function ObjViewer({ src }) {
  const items = createItems(src);
  return <Tree src={items} />;
}
