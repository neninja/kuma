import { expect, type Locator, type Page, test } from '@playwright/test';

const storageKey = 'kuma:expense-splitter:v1';

function moneyText(amount: string) {
  return new RegExp(`^R\\$\\s*${amount}$`);
}

async function addParticipant(page: Page, name: string) {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('button', { name: 'Adicionar' }).click();
}

async function addExpense(page: Page, payer: string, description: string, amount: string) {
  await page.getByLabel('Pago por').selectOption({ label: payer });
  await page.getByLabel('Identificacao').fill(description);
  await page.getByLabel('Valor').fill(amount);
  await page.getByRole('button', { name: 'Lancar despesa' }).click();
}

async function expectMoneyCard(page: Page, label: string, value: RegExp | string, detail: string) {
  const card = page.locator('kuma-money-card').filter({ hasText: label });

  await expect(card).toHaveCount(1);
  await expect(card.locator('strong')).toHaveText(value);
  await expect(card.locator('small')).toHaveText(detail);
}

async function expectParticipantBalance(
  row: Locator,
  paid: string,
  share: string,
  balance: RegExp | string
) {
  await expect(row.locator('td').nth(1)).toHaveText(moneyText(paid));
  await expect(row.locator('td').nth(2)).toHaveText(moneyText(share));
  await expect(row.locator('td').nth(3)).toHaveText(balance);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key: string) => {
    window.localStorage.removeItem(key);
  }, storageKey);
});

test('CUJ fixo de divisao de despesas com tres participantes e duas despesas', async ({ page }) => {
  await page.goto('/kuma/');

  await addParticipant(page, 'Ana');
  await addParticipant(page, 'Bruno');
  await addParticipant(page, 'Carla');

  await addExpense(page, 'Ana', 'Mercado', '120');
  await addExpense(page, 'Bruno', 'Taxi', '60');

  await expect(
    page.locator('section[aria-labelledby="participants-title"] .section-heading span')
  ).toHaveText('3 participantes');
  await expect(
    page.locator('section[aria-labelledby="expenses-title"] .section-heading span')
  ).toHaveText('2 despesas');

  await expectMoneyCard(page, 'Total pago', moneyText('180,00'), '2 despesas');
  await expectMoneyCard(page, 'Cota por participante', moneyText('60,00'), '3 participantes');
  await expectMoneyCard(page, 'Transferencias', '1', '1 transferencia');

  const expenses = page.locator('.expense-list li');
  await expect(expenses).toHaveCount(2);
  await expect(expenses.nth(0).locator('strong').nth(0)).toHaveText('Mercado');
  await expect(expenses.nth(0).locator('span')).toHaveText('Ana');
  await expect(expenses.nth(0).locator('strong').nth(1)).toHaveText(moneyText('120,00'));
  await expect(expenses.nth(1).locator('strong').nth(0)).toHaveText('Taxi');
  await expect(expenses.nth(1).locator('span')).toHaveText('Bruno');
  await expect(expenses.nth(1).locator('strong').nth(1)).toHaveText(moneyText('60,00'));

  const balanceRows = page.locator('section[aria-labelledby="balances-title"] tbody tr');
  await expect(balanceRows).toHaveCount(3);

  const ana = balanceRows.filter({ hasText: 'Ana' });
  const bruno = balanceRows.filter({ hasText: 'Bruno' });
  const carla = balanceRows.filter({ hasText: 'Carla' });

  await expect(ana.locator('td').nth(0)).toHaveText('Ana');
  await expect(bruno.locator('td').nth(0)).toHaveText('Bruno');
  await expect(carla.locator('td').nth(0)).toHaveText('Carla');
  await expectParticipantBalance(ana, '120,00', '60,00', /^Recebe R\$\s*60,00$/);
  await expectParticipantBalance(bruno, '60,00', '60,00', 'Quitado');
  await expectParticipantBalance(carla, '0,00', '60,00', /^Paga R\$\s*60,00$/);

  const settlement = page.locator(
    'section[aria-labelledby="settlements-title"] .settlement-list li'
  );
  await expect(settlement).toHaveCount(1);
  await expect(settlement.locator('span').nth(0)).toHaveText('Carla');
  await expect(settlement.locator('strong')).toHaveText(moneyText('60,00'));
  await expect(settlement.locator('span').nth(1)).toHaveText('Ana');
});
