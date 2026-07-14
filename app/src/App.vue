<script setup lang="ts">
import '@kuma/webcomponents/button';
import '@kuma/webcomponents/money-card';
import { computed, reactive, ref, watch } from 'vue';

type Participant = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  payerId: string;
  description: string;
  cents: number;
};

type ParticipantReport = Participant & {
  paidCents: number;
  shareCents: number;
  balanceCents: number;
};

type Settlement = {
  id: string;
  from: string;
  to: string;
  cents: number;
};

type ExpenseForm = {
  amount: number | string;
  description: string;
  payerId: string;
};

type SavedAppState = {
  participants: Participant[];
  expenses: Expense[];
  nextNumericId: number;
};

const storageKey = 'kuma:expense-splitter:v1';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency'
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isParticipant(value: unknown): value is Participant {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.name === 'string';
}

function isExpense(value: unknown): value is Expense {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.payerId === 'string' &&
    typeof value.description === 'string' &&
    typeof value.cents === 'number' &&
    Number.isFinite(value.cents) &&
    value.cents > 0
  );
}

function isSavedAppState(value: unknown): value is SavedAppState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.participants) &&
    value.participants.every(isParticipant) &&
    Array.isArray(value.expenses) &&
    value.expenses.every(isExpense) &&
    typeof value.nextNumericId === 'number' &&
    Number.isInteger(value.nextNumericId) &&
    value.nextNumericId >= 0
  );
}

function loadSavedAppState() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isSavedAppState(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function saveAppState(state: SavedAppState) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage can fail in private browsing or when quota is exceeded.
  }
}

function removeSavedAppState() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage cleanup failures; the in-memory reset still succeeds.
  }
}

function numericSuffix(value: string) {
  const match = value.match(/-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function highestNumericId(participantsValue: Participant[], expensesValue: Expense[]) {
  let highest = 0;

  for (const participant of participantsValue) {
    highest = Math.max(highest, numericSuffix(participant.id));
  }

  for (const expense of expensesValue) {
    highest = Math.max(highest, numericSuffix(expense.id));
  }

  return highest;
}

const savedAppState = loadSavedAppState();
const participants = ref<Participant[]>(savedAppState?.participants ?? []);
const expenses = ref<Expense[]>(savedAppState?.expenses ?? []);
const participantName = ref('');
const expenseForm = reactive<ExpenseForm>({
  amount: '',
  description: '',
  payerId: participants.value[0]?.id ?? ''
});

let nextNumericId = Math.max(
  savedAppState?.nextNumericId ?? 0,
  highestNumericId(participants.value, expenses.value)
);

function nextId(prefix: string) {
  nextNumericId += 1;
  return `${prefix}-${nextNumericId}`;
}

function formatMoney(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function parseAmountToCents(value: number | string) {
  const amount = typeof value === 'number' ? value : Number(value.replace(',', '.'));

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.round(amount * 100);
}

const totalCents = computed(() =>
  expenses.value.reduce((total, expense) => total + expense.cents, 0)
);

const paidByParticipant = computed(() => {
  const paid = new Map<string, number>();

  for (const participant of participants.value) {
    paid.set(participant.id, 0);
  }

  for (const expense of expenses.value) {
    paid.set(expense.payerId, (paid.get(expense.payerId) ?? 0) + expense.cents);
  }

  return paid;
});

const participantReports = computed<ParticipantReport[]>(() => {
  const participantCount = participants.value.length;
  const baseShare = participantCount > 0 ? Math.floor(totalCents.value / participantCount) : 0;
  const remainder = participantCount > 0 ? totalCents.value % participantCount : 0;

  return participants.value.map((participant, index) => {
    const shareCents = baseShare + (index < remainder ? 1 : 0);
    const paidCents = paidByParticipant.value.get(participant.id) ?? 0;

    return {
      ...participant,
      balanceCents: paidCents - shareCents,
      paidCents,
      shareCents
    };
  });
});

const settlements = computed<Settlement[]>(() => {
  const debtors = participantReports.value
    .filter((participant) => participant.balanceCents < 0)
    .map((participant) => ({
      id: participant.id,
      name: participant.name,
      remainingCents: Math.abs(participant.balanceCents)
    }))
    .sort((a, b) => b.remainingCents - a.remainingCents);

  const creditors = participantReports.value
    .filter((participant) => participant.balanceCents > 0)
    .map((participant) => ({
      id: participant.id,
      name: participant.name,
      remainingCents: participant.balanceCents
    }))
    .sort((a, b) => b.remainingCents - a.remainingCents);

  const transfers: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const cents = Math.min(debtor.remainingCents, creditor.remainingCents);

    if (cents > 0) {
      transfers.push({
        cents,
        from: debtor.name,
        id: `${debtor.id}-${creditor.id}-${transfers.length}`,
        to: creditor.name
      });
    }

    debtor.remainingCents -= cents;
    creditor.remainingCents -= cents;

    if (debtor.remainingCents === 0) {
      debtorIndex += 1;
    }

    if (creditor.remainingCents === 0) {
      creditorIndex += 1;
    }
  }

  return transfers;
});

const canAddParticipant = computed(() => participantName.value.trim().length > 0);
const canAddExpense = computed(() => {
  const payerExists = participants.value.some(
    (participant) => participant.id === expenseForm.payerId
  );

  return (
    payerExists &&
    expenseForm.description.trim().length > 0 &&
    parseAmountToCents(expenseForm.amount) > 0
  );
});

const shareLabel = computed(() => {
  const participantCount = participants.value.length;

  if (participantCount === 0) {
    return formatMoney(0);
  }

  const baseShare = Math.floor(totalCents.value / participantCount);
  const remainder = totalCents.value % participantCount;

  if (remainder === 0) {
    return formatMoney(baseShare);
  }

  return `${formatMoney(baseShare)} a ${formatMoney(baseShare + 1)}`;
});

const participantCountLabel = computed(() =>
  participants.value.length === 1 ? '1 participante' : `${participants.value.length} participantes`
);

const expenseCountLabel = computed(() =>
  expenses.value.length === 1 ? '1 despesa' : `${expenses.value.length} despesas`
);

const transferCountLabel = computed(() =>
  settlements.value.length === 1 ? '1 transferencia' : `${settlements.value.length} transferencias`
);
const canClearAll = computed(
  () =>
    participants.value.length > 0 ||
    expenses.value.length > 0 ||
    participantName.value.trim().length > 0 ||
    expenseForm.description.trim().length > 0 ||
    String(expenseForm.amount).trim().length > 0 ||
    expenseForm.payerId.length > 0
);

watch(
  [participants, expenses],
  () => {
    saveAppState({
      expenses: expenses.value,
      nextNumericId,
      participants: participants.value
    });
  },
  { deep: true, flush: 'sync' }
);

function addParticipant() {
  const name = participantName.value.trim();

  if (!name) {
    return;
  }

  const participant = {
    id: nextId('participant'),
    name
  };

  participants.value.push(participant);

  if (!expenseForm.payerId) {
    expenseForm.payerId = participant.id;
  }

  participantName.value = '';
}

function removeParticipant(participantId: string) {
  participants.value = participants.value.filter((participant) => participant.id !== participantId);
  expenses.value = expenses.value.filter((expense) => expense.payerId !== participantId);

  if (expenseForm.payerId === participantId) {
    expenseForm.payerId = participants.value[0]?.id ?? '';
  }
}

function addExpense() {
  if (!canAddExpense.value) {
    return;
  }

  expenses.value.push({
    cents: parseAmountToCents(expenseForm.amount),
    description: expenseForm.description.trim(),
    id: nextId('expense'),
    payerId: expenseForm.payerId
  });

  expenseForm.amount = '';
  expenseForm.description = '';
}

function removeExpense(expenseId: string) {
  expenses.value = expenses.value.filter((expense) => expense.id !== expenseId);
}

function clearAll() {
  nextNumericId = 0;
  participants.value = [];
  expenses.value = [];
  participantName.value = '';
  expenseForm.amount = '';
  expenseForm.description = '';
  expenseForm.payerId = '';
  removeSavedAppState();
}

function participantNameById(participantId: string) {
  return (
    participants.value.find((participant) => participant.id === participantId)?.name ??
    'Participante'
  );
}

function balanceClass(cents: number) {
  if (cents > 0) {
    return 'is-positive';
  }

  if (cents < 0) {
    return 'is-negative';
  }

  return 'is-even';
}

function balanceText(cents: number) {
  if (cents > 0) {
    return `Recebe ${formatMoney(cents)}`;
  }

  if (cents < 0) {
    return `Paga ${formatMoney(Math.abs(cents))}`;
  }

  return 'Quitado';
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <p>Divisao de despesas</p>
        <h1>Conciliação</h1>
      </div>

      <div class="header-actions">
        <kuma-button :disabled="!canClearAll" type="button" variant="danger" @click="clearAll">
          Limpar tudo
        </kuma-button>
      </div>
    </header>

    <div class="workspace-grid">
      <section class="tool-panel" aria-labelledby="participants-title">
        <div class="section-heading">
          <h2 id="participants-title">Participantes</h2>
          <span>{{ participantCountLabel }}</span>
        </div>

        <form class="entry-form" @submit.prevent="addParticipant">
          <label for="participant-name">Nome</label>
          <div class="field-row">
            <input
              id="participant-name"
              v-model="participantName"
              autocomplete="off"
              maxlength="40"
              placeholder="Ex.: Ana"
              type="text"
            />
            <kuma-button
              :disabled="!canAddParticipant"
              type="button"
              variant="primary"
              @click="addParticipant"
            >
              Adicionar
            </kuma-button>
          </div>
        </form>

        <ul v-if="participants.length > 0" class="entity-list">
          <li v-for="participant in participants" :key="participant.id">
            <span>{{ participant.name }}</span>
            <button
              :aria-label="`Remover ${participant.name}`"
              class="icon-button"
              type="button"
              @click="removeParticipant(participant.id)"
            >
              x
            </button>
          </li>
        </ul>

        <p v-else class="empty-state">Nenhum participante cadastrado.</p>
      </section>

      <section class="tool-panel" aria-labelledby="expenses-title">
        <div class="section-heading">
          <h2 id="expenses-title">Despesas</h2>
          <span>{{ expenseCountLabel }}</span>
        </div>

        <form class="expense-form" @submit.prevent="addExpense">
          <div class="field">
            <label for="expense-payer">Pago por</label>
            <select
              id="expense-payer"
              v-model="expenseForm.payerId"
              :disabled="participants.length === 0"
            >
              <option disabled value="">Selecione</option>
              <option
                v-for="participant in participants"
                :key="participant.id"
                :value="participant.id"
              >
                {{ participant.name }}
              </option>
            </select>
          </div>

          <div class="field field-wide">
            <label for="expense-description">Identificacao</label>
            <input
              id="expense-description"
              v-model="expenseForm.description"
              autocomplete="off"
              placeholder="Ex.: Mercado"
              type="text"
              @keydown.enter.prevent="addExpense"
            />
          </div>

          <div class="field">
            <label for="expense-amount">Valor</label>
            <input
              id="expense-amount"
              v-model="expenseForm.amount"
              inputmode="decimal"
              min="0"
              placeholder="0,00"
              step="0.01"
              type="text"
              @keydown.enter.prevent="addExpense"
            />
          </div>

          <kuma-button
            :disabled="!canAddExpense"
            type="button"
            variant="primary"
            @click="addExpense"
          >
            Lancar despesa
          </kuma-button>
        </form>

        <ul v-if="expenses.length > 0" class="expense-list">
          <li v-for="expense in expenses" :key="expense.id">
            <div>
              <strong>{{ expense.description }}</strong>
              <span>{{ participantNameById(expense.payerId) }}</span>
            </div>
            <strong>{{ formatMoney(expense.cents) }}</strong>
            <button
              :aria-label="`Remover despesa ${expense.description}`"
              class="icon-button"
              type="button"
              @click="removeExpense(expense.id)"
            >
              x
            </button>
          </li>
        </ul>

        <p v-else class="empty-state">Nenhuma despesa lancada.</p>
      </section>
    </div>

    <section class="report-section" aria-labelledby="report-title">
      <div class="section-heading">
        <h2 id="report-title">Relatorio</h2>
        <span>{{ transferCountLabel }}</span>
      </div>

      <div class="metric-grid">
        <kuma-money-card
          label="Total pago"
          :value="formatMoney(totalCents)"
          :detail="expenseCountLabel"
          tone="positive"
        />
        <kuma-money-card
          label="Cota por participante"
          :value="shareLabel"
          :detail="participantCountLabel"
          tone="neutral"
        />
        <kuma-money-card
          label="Transferencias"
          :value="String(settlements.length)"
          :detail="transferCountLabel"
          tone="warning"
        />
      </div>

      <div class="report-grid">
        <section class="data-panel" aria-labelledby="balances-title">
          <h3 id="balances-title">Por participante</h3>

          <div v-if="participantReports.length > 0" class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Pagou</th>
                  <th>Cota</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="participant in participantReports" :key="participant.id">
                  <td>{{ participant.name }}</td>
                  <td>{{ formatMoney(participant.paidCents) }}</td>
                  <td>{{ formatMoney(participant.shareCents) }}</td>
                  <td>
                    <span class="balance-pill" :class="balanceClass(participant.balanceCents)">
                      {{ balanceText(participant.balanceCents) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="empty-state">Nenhum participante cadastrado.</p>
        </section>

        <section class="data-panel" aria-labelledby="settlements-title">
          <h3 id="settlements-title">Transferencias</h3>

          <ol v-if="settlements.length > 0" class="settlement-list">
            <li v-for="settlement in settlements" :key="settlement.id">
              <span>{{ settlement.from }}</span>
              <strong>{{ formatMoney(settlement.cents) }}</strong>
              <span>{{ settlement.to }}</span>
            </li>
          </ol>

          <p v-else-if="participants.length === 0" class="empty-state">
            Nenhum participante cadastrado.
          </p>
          <p v-else-if="expenses.length === 0" class="empty-state">Nenhuma despesa lancada.</p>
          <p v-else class="empty-state">Tudo conciliado.</p>
        </section>
      </div>
    </section>
  </main>
</template>
