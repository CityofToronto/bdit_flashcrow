import { Enum } from '@/lib/ClassUtils';

class Color extends Enum {}
const colorValues = ['RED', 'GREEN', 'BLUE'];
Color.init(colorValues);

class CssColor extends Enum {}
const cssColorValues = {
  RED: {
    hex: '#f00',
  },
  GREEN: {
    hex: '#0f0',
  },
  BLUE: {
    hex: '#00f',
  },
};
CssColor.init(cssColorValues);

test('Enum non-tamperable', () => {
  /* eslint-disable no-new */
  // cannot instantiate Enum after init()
  expect(() => {
    new Color({});
  }).toThrow();

  // cannot tamper with enumValues after init()
  expect(() => {
    Color.enumValues.push('invalid');
  }).toThrow();
});

test('Enum instanceof', () => {
  colorValues.forEach((name) => {
    expect(Color[name] instanceof Color).toBe(true);
  });
});

test('Enum name / ordinal', () => {
  colorValues.forEach((name, ordinal) => {
    expect(Color[name].name).toBe(name);
    expect(Color[name].ordinal).toBe(ordinal);
  });
  expect(() => {
    Color.enumValueOf('FOO');
  }).toThrow();
});

test('Enum object properties', () => {
  Object.entries(cssColorValues).forEach(([name, { hex }]) => {
    expect(CssColor[name].hex).toBe(hex);
  });
});

test('Enum enumValues', () => {
  expect(Color.enumValues).toHaveLength(3);
  colorValues.forEach((name) => {
    expect(Color.enumValueOf(name)).toBe(Color[name]);
  });
});
