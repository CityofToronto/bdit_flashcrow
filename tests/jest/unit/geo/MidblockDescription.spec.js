import MidblockDescription from '@/lib/geo/MidblockDescription';

test('MidblockDescription.get', () => {
  expect(MidblockDescription.get(
    'Sudbury St',
    'Dovercourt Rd / Sudbury St',
    'Sudbury St / Ln E Lisgar N Sudbury',
  )).toBe('Sudbury St: Dovercourt Rd \u2013 Ln E Lisgar N Sudbury');
  expect(MidblockDescription.get(
    'Ln N Corby E Caledonia',
    'Caledonia Rd / Ln N Corby E Caledonia / Ln N Corby W Caledonia',
    'Ln S Summit E Caledonia / Ln N Corby E Caledonia',
  )).toBe('Ln N Corby E Caledonia: Caledonia Rd \u2013 Ln S Summit E Caledonia');
  expect(MidblockDescription.get(
    'Leslie St',
    'Leslie St / 401 C E Leslie St S Ramp / C N R',
    'Leslie St / Lesmill Rd / Leslie N 401 C E Ramp / 401 C E Leslie St Ramp',
  )).toBe('Leslie St: 401 C E Leslie St S Ramp \u2013 Lesmill Rd');
  expect(MidblockDescription.get(
    'Armour Blvd',
    'Armour Blvd / Belgrave Ave',
    'Armour Blvd',
  )).toBe('Armour Blvd: near Belgrave Ave');
  expect(MidblockDescription.get(
    'Old Finch Ave',
    'Old Finch Ave / Morningview Trl / Valley Centre Dr',
    'Old Finch Ave',
  )).toBe('Old Finch Ave: near Valley Centre Dr');
  expect(MidblockDescription.get(
    'Flaming Roseway',
    'Flaming Roseway',
    'Flaming Roseway',
  )).toBe('Flaming Roseway');
  expect(MidblockDescription.get(
    'Aviemore Dr',
    'Aviemore Dr / Franel Cres',
    'Aviemore Dr / Franel Cres',
  )).toBe('Aviemore Dr: Franel Cres \u2013 Franel Cres');
  expect(MidblockDescription.get(
    'Bloor St',
    null,
    null,
  )).toBe('Bloor St');
});
