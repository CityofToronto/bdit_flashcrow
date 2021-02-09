import Random from '@/lib/Random';
import DomIdGenerator from '@/web/ui/DomIdGenerator';

test('DomIdGenerator.generate', () => {
  const generatedIds = new Set();
  for (let i = 0; i < 100; i++) {
    const prefix = Random.choice(['a', 'b', 'c']);
    const id = DomIdGenerator.generateId(prefix);
    expect(generatedIds.has(id)).toBe(false);
    generatedIds.add(id);
  }
  expect(generatedIds.size).toBe(100);
});
