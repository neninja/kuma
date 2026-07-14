import { expect, test } from '@playwright/test';

test('kuma-money-card renderiza conteudo e tone no browser', async ({ page }) => {
  await page.goto('/tests/fixtures/index.html');
  await page.setContent(`
    <kuma-money-card
      detail="2 despesas"
      label="Total pago"
      tone="positive"
      value="R$ 180,00"
    ></kuma-money-card>
  `);
  await page.addScriptTag({ type: 'module', url: '/src/kuma-money-card.ts' });
  await page.evaluate(() => customElements.whenDefined('kuma-money-card'));

  const host = page.locator('kuma-money-card');

  await expect(host).toHaveAttribute('tone', 'positive');
  await expect(host.locator('article')).toBeVisible();
  await expect(host.locator('span')).toHaveText('Total pago');
  await expect(host.locator('strong')).toHaveText('R$ 180,00');
  await expect(host.locator('small')).toHaveText('2 despesas');
});
