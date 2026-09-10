<template>
  <div v-if="open" class="thread-action-confirm-backdrop" role="presentation" @click.self="emit('cancel')">
    <section
      ref="dialogRef"
      class="thread-action-confirm-dialog"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
      @keydown.esc="emit('cancel')"
    >
      <h2 :id="titleId">{{ title }}</h2>
      <p :id="descriptionId">{{ description }}</p>
      <p class="thread-action-confirm-name" :title="threadTitle">{{ threadTitle }}</p>

      <footer class="thread-action-confirm-footer">
        <button class="thread-action-confirm-cancel" type="button" @click="emit('cancel')">
          {{ t('sidebarTree.cancel') }}
        </button>
        <button
          class="thread-action-confirm-submit"
          :data-danger="isDelete"
          type="button"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { tUi, type UiLanguage, type UiTextKey } from '../../i18n/uiText'

const props = defineProps<{
  open: boolean
  action: 'archive' | 'delete'
  threadTitle: string
  uiLanguage?: UiLanguage
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const normalizedLanguage = computed<UiLanguage>(() => props.uiLanguage ?? 'zh')
const isDelete = computed(() => props.action === 'delete')
const title = computed(() =>
  t(isDelete.value ? 'sidebarTree.deleteThreadConfirmTitle' : 'sidebarTree.archiveThreadConfirmTitle'),
)
const description = computed(() =>
  t(
    isDelete.value
      ? 'sidebarTree.deleteThreadConfirmDescription'
      : 'sidebarTree.archiveThreadConfirmDescription',
    { threadTitle: props.threadTitle },
  ),
)
const confirmLabel = computed(() =>
  t(isDelete.value ? 'sidebarTree.confirmDeleteThread' : 'sidebarTree.confirmArchiveThread'),
)
const titleId = 'thread-action-confirm-title'
const descriptionId = 'thread-action-confirm-description'

function t(key: UiTextKey, params?: Record<string, number | string>): string {
  return tUi(normalizedLanguage.value, key, params)
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    dialogRef.value?.focus()
  },
  { immediate: true },
)
</script>

<style scoped>
@reference "tailwindcss";

.thread-action-confirm-backdrop {
  @apply fixed inset-0 z-60 flex items-center justify-center p-4;
  background: color-mix(in srgb, #000 35%, transparent);
}

.thread-action-confirm-dialog {
  @apply w-full max-w-md rounded-xl border p-5 shadow-2xl;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
}

.thread-action-confirm-dialog h2 {
  @apply m-0 text-base font-semibold;
}

.thread-action-confirm-dialog p {
  @apply mt-2 text-sm;
  color: var(--color-text-secondary);
}

.thread-action-confirm-name {
  @apply rounded-md border px-3 py-2 truncate;
  color: var(--color-text-primary) !important;
  background: var(--color-bg-surface);
  border-color: var(--color-border-default);
}

.thread-action-confirm-footer {
  @apply mt-5 flex items-center justify-end gap-2;
}

.thread-action-confirm-cancel,
.thread-action-confirm-submit {
  @apply rounded-md px-3 py-1.5 text-sm transition;
}

.thread-action-confirm-cancel {
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
}

.thread-action-confirm-cancel:hover {
  background: var(--color-bg-muted);
}

.thread-action-confirm-submit {
  color: white;
  background: var(--color-accent, #2563eb);
}

.thread-action-confirm-submit:hover {
  filter: brightness(0.95);
}

.thread-action-confirm-submit[data-danger='true'] {
  @apply bg-rose-600 hover:bg-rose-700;
}
</style>
