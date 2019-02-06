import { shallowMount } from '@vue/test-utils';
import Home from '@/views/Home.vue';

test('Home.vue renders properly', () => {
  const wrapper = shallowMount(Home, {
    propsData: { },
  });
  expect(wrapper.contains('div')).toBe(true);
});
