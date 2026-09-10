<template>
  <div v-if="open" class="source-folders-backdrop" role="presentation" @click.self="emit('close')">
    <section
      class="source-folders-dialog"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="t('sidebarTree.sourceFoldersTitle', { projectName })"
      @keydown.esc="emit('close')"
    >
      <header class="source-folders-header">
        <div>
          <h2>{{ t('sidebarTree.sourceFoldersTitle', { projectName }) }}</h2>
          <p>{{ t('sidebarTree.sourceFoldersDescription') }}</p>
        </div>
        <button
          class="source-folders-close"
          type="button"
          :aria-label="t('sidebarTree.cancel')"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="source-folders-list">
        <label v-for="folder in draftFolders" :key="folder" class="source-folder-row">
          <input
            v-model="draftPrimary"
            type="radio"
            name="primary-source-folder"
            :value="folder"
            :aria-label="`${t('sidebarTree.primarySourceFolder')}: ${folder}`"
          />
          <span class="source-folder-path" :title="folder">{{ folder }}</span>
          <span v-if="draftFolders.length > 1 && draftPrimary === folder" class="source-folder-primary">
            {{ t('sidebarTree.primarySourceFolder') }}
          </span>
          <button
            v-if="draftFolders.length > 1"
            class="source-folder-remove"
            type="button"
            :aria-label="`${t('sidebarTree.removeSourceFolder')}: ${folder}`"
            @pointerdown.stop
            @click.stop.prevent="removeFolder(folder)"
          >
            ×
          </button>
        </label>

        <p v-if="draftFolders.length === 0" class="source-folders-empty">{{ t('sidebarTree.noThreads') }}</p>
      </div>

      <form class="source-folder-add-form" @submit.prevent="addFolder">
        <input
          ref="folderInputRef"
          v-model="folderDraft"
          class="source-folder-add-input"
          type="text"
          :placeholder="t('sidebarTree.sourceFolderPlaceholder')"
        />
        <button class="source-folder-add-button" type="submit" :disabled="folderDraft.trim().length === 0">
          {{ t('sidebarTree.addSourceFolder') }}
        </button>
      </form>

      <footer class="source-folders-footer">
        <button class="source-folders-secondary" type="button" @click="emit('close')">
          {{ t('sidebarTree.cancel') }}
        </button>
        <button class="source-folders-primary" type="button" :disabled="draftFolders.length === 0" @click="save">
          {{ t('sidebarTree.save') }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { tUi, type UiLanguage, type UiTextKey } from '../../i18n/uiText'
import { collapsePathSegments } from '../../utils/pathUtils'

const props = defineProps<{
  open: boolean
  projectName: string
  folders: string[]
  primaryCwd: string
  uiLanguage?: UiLanguage
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { folders: string[]; primaryCwd: string }]
}>()

const normalizedLanguage = computed<UiLanguage>(() => props.uiLanguage ?? 'zh')
const draftFolders = ref<string[]>([])
const draftPrimary = ref('')
const folderDraft = ref('')
const folderInputRef = ref<HTMLInputElement | null>(null)

function t(key: UiTextKey, params?: Record<string, number | string>): string {
  return tUi(normalizedLanguage.value, key, params)
}

function resetDraft(): void {
  draftFolders.value = Array.from(new Set(props.folders.map((folder) => collapsePathSegments(folder)).filter(Boolean)))
  const normalizedPrimaryCwd = collapsePathSegments(props.primaryCwd)
  draftPrimary.value = draftFolders.value.includes(normalizedPrimaryCwd)
    ? normalizedPrimaryCwd
    : draftFolders.value[0] ?? ''
  folderDraft.value = ''
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    resetDraft()
    await nextTick()
    folderInputRef.value?.focus()
  },
  { immediate: true },
)

function addFolder(): void {
  const folder = collapsePathSegments(folderDraft.value)
  if (!folder || draftFolders.value.includes(folder)) return
  draftFolders.value = [...draftFolders.value, folder]
  if (!draftPrimary.value) draftPrimary.value = folder
  folderDraft.value = ''
  folderInputRef.value?.focus()
}

function removeFolder(folder: string): void {
  const nextFolders = draftFolders.value.filter((item) => item !== folder)
  draftFolders.value = nextFolders
  if (draftPrimary.value === folder) {
    draftPrimary.value = nextFolders[0] ?? ''
  }
}

function save(): void {
  if (draftFolders.value.length === 0) return
  emit('save', {
    folders: draftFolders.value,
    primaryCwd: draftPrimary.value || draftFolders.value[0],
  })
}
</script>

<style scoped>
@reference "tailwindcss";

.source-folders-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
  background: color-mix(in srgb, #000 35%, transparent);
}

.source-folders-dialog {
  @apply w-full max-w-xl rounded-xl border p-5 shadow-2xl;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
}

.source-folders-header {
  @apply flex items-start justify-between gap-4;
}

.source-folders-header h2 {
  @apply m-0 text-base font-semibold;
}

.source-folders-header p {
  @apply mt-1 text-sm;
  color: var(--color-text-secondary);
}

.source-folders-close,
.source-folder-remove {
  @apply h-7 w-7 shrink-0 rounded-md text-lg leading-none transition;
  color: var(--color-text-muted);
}

.source-folders-close:hover,
.source-folder-remove:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
}

.source-folders-list {
  @apply mt-5 flex max-h-64 flex-col gap-1 overflow-y-auto;
}

.source-folder-row {
  @apply flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2;
  border-color: var(--color-border-default);
}

.source-folder-row:hover {
  background: var(--color-bg-subtle);
}

.source-folder-path {
  @apply min-w-0 flex-1 truncate text-sm;
}

.source-folder-primary {
  @apply shrink-0 rounded-full px-2 py-0.5 text-xs;
  color: var(--color-success-text);
  background: var(--color-success-soft);
}

.source-folders-empty {
  @apply py-4 text-center text-sm;
  color: var(--color-text-muted);
}

.source-folder-add-form {
  @apply mt-4 flex gap-2;
}

.source-folder-add-input {
  @apply min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  border-color: var(--color-border-default);
}

.source-folder-add-button,
.source-folders-primary,
.source-folders-secondary {
  @apply rounded-md px-3 py-2 text-sm transition;
}

.source-folder-add-button,
.source-folders-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50;
}

.source-folders-footer {
  @apply mt-5 flex justify-end gap-2;
}

.source-folders-secondary {
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
}

.source-folders-secondary:hover {
  background: var(--color-bg-muted);
}
</style>
