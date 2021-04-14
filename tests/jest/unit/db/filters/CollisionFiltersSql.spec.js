import { CentrelineType } from '@/lib/Constants';
import Random from '@/lib/Random';
import { getCollisionFilters } from '@/lib/db/filters/CollisionFiltersSql';
import { normalizeCollisionQuery } from '@/lib/model/helpers/NormalizeUtils';
import { generateFilters } from '@/lib/test/random/FilterGenerator';

function generateFeature() {
  const centrelineId = Random.range(100, 30000000);
  const centrelineType = Random.choice([CentrelineType.INTERSECTION, CentrelineType.SEGMENT]);
  return { centrelineId, centrelineType };
}

function generateFeatures() {
  const n = Random.range(1, 6);
  const features = [];
  for (let i = 0; i < n; i++) {
    const feature = generateFeature();
    features.push(feature);
  }
  return features;
}

test('CollisionFiltersSql.getCollisionFilters [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const features = generateFeatures();
    const { filtersCollision, filtersCommon } = generateFilters();
    const collisionQuery = { ...filtersCollision, ...filtersCommon };
    const collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);

    // ensure structure
    const { filters, params } = getCollisionFilters(features, collisionQueryNormalized);
    expect(filters).toBeInstanceOf(Array);
    expect(params).toBeInstanceOf(Object);

    // ensure filters actually have corresponding parameter values
    filters.forEach((filter) => {
      const filterParamMatches = Array.from(filter.matchAll(/\$\(([^)]*)\)/g));
      filterParamMatches.forEach((filterParamMatch) => {
        const [filterParam] = filterParamMatch[1].split(':');
        expect(params).toHaveProperty(filterParam);
      });
    });
  }
});
