import { shallowMount } from '@vue/test-utils';
import Home from '@/views/Home.vue';

describe('Home.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(Home, {
      propsData: { },
    });
    expect(wrapper.contains('div')).toBe(true);
  });
});
