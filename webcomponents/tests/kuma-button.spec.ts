import { expect, test } from '@playwright/test';

test('kuma-button renderiza slot, tipo, variante e estado disabled no browser', async ({
  page
}) => {
  await page.goto('/tests/fixtures/index.html');
  await page.setContent('<kuma-button disabled variant="danger">Excluir</kuma-button>');
  await page.addScriptTag({ type: 'module', url: '/src/kuma-button.ts' });
  await page.evaluate(() => customElements.whenDefined('kuma-button'));

  const host = page.locator('kuma-button');
  const button = host.locator('button');

  await expect(host).toHaveAttribute('disabled', '');
  await expect(host).toHaveAttribute('variant', 'danger');
  await expect(host).toHaveText('Excluir');
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('type', 'button');
});
