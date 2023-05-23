<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NInput, NPopconfirm,NCheckbox, NCheckboxGroup, NScrollbar } from 'naive-ui'
// import {  useMessage } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
// import { copyText } from '@/utils/format'
const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()
// console.log(chatStore.$state)
const dataSources = computed(() => chatStore.sortTimeChat)
// const Message = useMessage()
async function handleSelect({ id }: Chat.ChatInfo) {
  if (isActive(id))
    return
  await chatStore.setActive(id)

  if (chatStore.active)
    chatStore.updateHistory(id, { isEdit: false })

  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleEdit({ id }: Chat.ChatInfo, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(id, { isEdit })
}

function handleDelete(index: number, { id }: Chat.ChatInfo, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()
  chatStore.deleteHistory(id)
}

function handleEnter({ id }: Chat.ChatInfo, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter')
    chatStore.updateHistory(id, { isEdit })
}

function isActive(id: any) {
  return chatStore.active === id
}


</script>

<template>
  <NScrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm scroll">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <n-checkbox-group v-model:value="chatStore.deleteIds">
        <div v-for="(row, i) of dataSources" :key="i">
          <div v-if="row.data.length > 0" class="px-1 py-1">
             {{ row.title }}
          </div>
          <div v-for="(item, index) of row.data" :key="index" class="group">
            <a
              class="question-list relative flex items-center gap-3 px-3 py-3 mt-1 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
              :class="isActive(item.id) && ['border-[#00CCFF]', 'bg-neutral-100', 'text-[#0099FF]', 'dark:bg-[#24272e]', 'dark:border-[#0099FF]', 'pr-14']"
              @click="handleSelect(item)"
            >
              <span>
                 <n-checkbox :value="item.id" label="" @click.stop/>
              </span>
              <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
                <NInput
                  v-if="item.isEdit" v-model:value="item.tem" size="tiny"
                  @keypress="handleEnter(item, false, $event)"
                />
                <span v-else>{{ item.title || '新建问题' }}</span>
              </div>
              <!-- v-if="isActive(item.uuid)" -->
              <div class="absolute z-10 flex visible right-1">
                <template v-if="item.isEdit && isActive(item.id)">
                  <button class="p-1" @click="handleEdit(item, false, $event)">
                    <SvgIcon icon="ri:save-line" />
                  </button>
                </template>
                <template v-if="!item.isEdit">
                  <button v-if="isActive(item.id)" class="p-1">
                    <SvgIcon icon="ri:edit-line" @click="handleEdit(item, true, $event)" />
                  </button>
                  <!-- group-hover:visible -->
                  <div :class="isActive(item.id) ? 'visible' : 'invisible group-hover:visible'">
                    <NPopconfirm placement="bottom" @positive-click="handleDelete(index, item, $event)">
                      <template #trigger>
                        <button class="p-1" @click.stop>
                          <SvgIcon icon="ri:delete-bin-line" />
                        </button>
                      </template>
                      {{ $t('chat.deleteHistoryConfirm') }}
                    </NPopconfirm>
                  </div>
                </template>
              </div>
            </a>
          </div>
        </div>
        </n-checkbox-group>
      </template>
    </div>
  </NScrollbar>
</template>
