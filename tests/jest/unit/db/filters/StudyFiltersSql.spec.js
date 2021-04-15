import { CentrelineType } from '@/lib/Constants';
import Random from '@/lib/Random';
import { getStudyFilters } from '@/lib/db/filters/StudyFiltersSql';
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
  for (let i = 0; i < 25; i++) {
    const features = generateFeatures();
    const { filtersCommon, filtersStudy } = generateFilters();
    const collisionQuery = { ...filtersCommon, ...filtersStudy };

    // ensure structure
    const categories = new Map();
    const { filters, params } = getStudyFilters(features, collisionQuery, categories);
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
