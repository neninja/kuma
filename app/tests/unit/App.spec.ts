import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';

import App from '../../src/App.vue';

test('renderiza o titulo e as regioes fixas com aria-labelledby', () => {
  window.localStorage.clear();

  const wrapper = mount(App);

  expect(wrapper.get('h1').text()).toBe('Conciliação');

  const labelledRegions = [
    ['participants-title', 'Participantes'],
    ['expenses-title', 'Despesas'],
    ['report-title', 'Relatorio'],
    ['balances-title', 'Por participante'],
    ['settlements-title', 'Transferencias']
  ];

  for (const [id, heading] of labelledRegions) {
    const region = wrapper.get(`[aria-labelledby="${id}"]`);

    expect(region.get(`#${id}`).text()).toBe(heading);
  }
});
