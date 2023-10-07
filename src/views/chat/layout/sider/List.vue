<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NInput, NPopconfirm, NScrollbar } from 'naive-ui'
import { CheckboxGroup, Checkbox } from 'ant-design-vue'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import dayjs from 'dayjs'
import { useTheme } from '@/hooks/useTheme'
const { vantTheme } = useTheme()
// import { copyText } from '@/utils/format'
const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()
let hover = ref({})
// console.log(chatStore.$state)
const dataSources = computed(() => chatStore.sortTimeChat)
interface Props {
  isDelete: boolean
}
let props = defineProps<Props>()

const emit = defineEmits<Emit>()

interface Emit {
  (e: 'cancel'): void
  (e: 'save'): void
}

// const Message = useMessage()
async function handleSelect({ id }: Chat.ChatInfo) {
  if (isActive(id))
    return
  await chatStore.setActive(id)

  if (chatStore.active)
    chatStore.updateHistory(id, { isEdit: false })

  // if (isMobile.value)
  //   appStore.setSiderCollapsed(true)
}

function handleEdit({ id }: Chat.ChatInfo, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(id, { isEdit })
}
function handleCancel({ id }: Chat.ChatInfo, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  chatStore.updateHistory(id, { isEdit, isCancel: true })
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
function handleInfoCancel() {
  chatStore.deleteIds = [];
  emit('cancel')

}
function handleChoose() {
  // hover.value.massage = !hover.value.massage
  // title：高度 63px
  // 高度： 57px
  // console.log(dataSources.value)
  let dom = document.querySelector('.my-drawer .n-scrollbar-container');
  if (!dom) return;
  let titleHeight = 63;
  // let cellHeight = 57;
  let cellHeight = 83;
  let height = dom.scrollTop + cellHeight;
  let calcHeight = 0 - titleHeight;

  // height
  let arr = [];
  let flag = false;
  // calcHeight += 63;
  dataSources.value.forEach((row, i) => {
    if (flag) {
      row.data.forEach(data => {
        // console.log(height, calcHeight, height < calcHeight)
        if (height <= calcHeight) {
          arr.push(data)
        } else {
          calcHeight += cellHeight;
        }
      })
    } else {
      if (row.data.length === 0) return;
      calcHeight += titleHeight;
      console.log('calcHeight', calcHeight)
      row.data.forEach(data => {
        // console.log(height, calcHeight, height < calcHeight)
        if (height <= calcHeight) {
          flag = true;
          arr.push(data)
        } else {
          calcHeight += cellHeight;
        }
      })
    }



  })


  chatStore.deleteIds = []
  arr.forEach(element => {
    let index = chatStore.deleteIds.indexOf(element.id)
    if (index === -1) {
      chatStore.deleteIds.push(element.id)
    } else {
      chatStore.deleteIds.splice(index, 1)
    }
  });

}

function handleScroll(e) {
  let dom = document.querySelector('.my-drawer .n-scrollbar-container')
  console.log(dom.scrollTop)

}
function handleAddItem(id) {
  let index = chatStore.deleteIds.indexOf(id)
  if (index === -1) {
    chatStore.deleteIds.push(id)
  } else {
    chatStore.deleteIds.splice(index, 1)
  }
}

function formatData(timestamp) {
  return dayjs(timestamp).format("MM月DD HH: mm")
}
</script>

<template>
  <NScrollbar class="relative" @scroll="handleScroll">
    <div class="absolute z-10 w-[100%] left-[0px] top-[128px] z-40 border-box " v-if="isDelete">
      <div class="absolute h-[1px] w-[100%] bg-[#3875F6] top-[13px] bg-[#82879399] dark:bg-[#6A6A6A]"
        :class="[hover.massage ? 'dark:bg-[#7569FF]' : '']">
      </div>
      <div
        class="absolute flex items-center justify-center right-[36px] text-[#ADB1BA] border-[#82879399] cursor-pointer bg-[#fff] dark:bg-[#282828] dark:text-[#6A6A6A] dark:border-[#6A6A6A]"
        :class="[hover.massage ? 'dark:text-[#7569FF] dark:border-[#7569FF]' : '']" style="
        width: 86px;
        height: 27px;
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        font-size: 11px;
        font-weight: 400;
        line-height: 1" @click="handleChoose">选择以下消息</div>
    </div>
    <div class="flex flex-col gap-2 text-sm scroll">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <!-- {{ chatStore.deleteIds }} -->
        <CheckboxGroup v-model:value="chatStore.deleteIds">
          <div v-for="(row, i) of dataSources" class="position" :key="i">
            <div v-if="row.data.length > 0" class="relative text-[12px] text-center pt-[22px]">
              <div class="absolute  px-[34px]
              w-[100%]" v-if="i == 0"
                style="height:0.5px;left: 0;top: 30px;">
                <div class="w-[100%] bg-[#e0e0e099] dark:bg-[#16161699]" style="height:0.5px;width:100%;"></div>
              </div>
              <div
                class="relative z-10 bg-[#fff] text-[#828793] dark:bg-[#212121] dark:text-[#69696A] inline-block px-[10px] ">
                {{ row.title }}</div>
            </div>
            <div v-for="(item, index) of row.data" :key="index" class="group px-[34px]"
              :class="isActive(item.id) ? ['dark:bg-[#292929] bg-[#f6f7fa]' ] : []">
              <div
                class="question-list relative flex items-center gap-3 py-[17px] break-all cursor-pointer dark:border-neutral-800 !border-[#e0e0e099] pr-[110px] dark:!border-[#16161699]"
                @click="handleSelect(item)">
                <div class="w-[100%]">
                  <div
                    class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap text-[#1A1A1A] dark:text-[#FFFFFF] title mb-[4px]">
                    <input class="input-title  border-[#3875F6] dark:border-[#7569FF] border-box" v-if="item.isEdit"
                      v-model="item.tem" size="tiny" @keypress="handleEnter(item, false, $event)" />
                    <span v-else>{{ item.title || '新建问题' }}</span>
                  </div>
                  <div
                    class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap text-[#828793] dark:text-[#8E8E8E]">
                    <span v-if="item.firstContent">{{ item.firstContent }}</span>
                    <span v-else>&nbsp;</span>
                  </div>
                </div>
                <!-- v-if="isActive(item.uuid)" -->
                <div
                  class="absolute z-10 flex items-center justify-center visible right-1 text-[#818894] h-[100%] w-[100px]">
                  <template v-if="isDelete">
                    <div class="mr-[px] w-[40px] h-[40px] flex flex-center justify-center"
                      @click.stop="handleAddItem(item.id)">
                      <Checkbox class="my-checkbox" :value="item.id" label="" @click.stop />
                    </div>
                  </template>
                  <template v-if="!isDelete && item.isEdit && isActive(item.id)">
                    <div class="-mt-[26px]">
                      <button
                        class="py-[5px] px-[9px] !border-[#818894] rounded-[5px] mr-[5px] dark:text-[#8E8E8E] dark:!border-[#3A3A3C]   hover:!border-[#3875f6] hover:dark:text-[#fff] hover:dark:!border-[#7569FF]"
                        @click="handleCancel(item, false, $event)" style="border:1px solid">
                        取消
                      </button>
                      <button
                        class="py-[5px] px-[8px] !border-[#818894] rounded-[5px] hover:!border-[#3875f6] dark:text-[#8E8E8E] dark:!border-[#3A3A3C] hover:dark:text-[#fff] hover:dark:!border-[#7569FF]"
                        @click="handleEdit(item, false, $event)" style="border:1px solid">
                        保存
                      </button>
                    </div>
                  </template>
                  <template v-if="!isDelete && !item.isEdit">
                    <div class="flex items-center justify-center w-[100%]">
                      <div class="text-[#adb1ba] dark:text-[#69696A] " v-if="!isActive(item.id)">{{
                        formatData(item.timestamp) }}</div>
                      <div class="flex justify-center" v-if="isActive(item.id)">
                        <div v-if="isActive(item.id)"
                          class="w-[30px] h-[30px] flex items-center justify-center mr-[15px] rounded-[6px] hover:dark:bg-[#3A3A3C]"
                          @mouseleave="() => {
                            hover.edit = false
                          }" @mouseenter="() => { hover.edit = true }">
                          <div v-if="vantTheme === 'light'">
                            <img v-show="!hover.edit"
                              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-edit.png"
                              class="w-[20px] " alt="" @click="handleEdit(item, true, $event)" />
                            <img v-show="hover.edit"
                              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-edit_active.png"
                              class="w-[20px]" alt="" @click="handleEdit(item, true, $event)" />
                          </div>
                          <div v-if="vantTheme === 'dark'">
                            <img v-show="!hover.edit"
                              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-edit.png"
                              class="w-[20px] " alt="" @click="handleEdit(item, true, $event)" />
                            <img v-show="hover.edit"
                              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-edit_active.png"
                              class="w-[20px]" alt="" @click="handleEdit(item, true, $event)" />
                          </div>
                        </div>
                        <!-- group-hover:visible -->
                        <div :class="isActive(item.id) ? 'visible' : 'invisible group-hover:visible'">
                          <NPopconfirm placement="bottom" @positive-click="handleDelete(index, item, $event)">
                            <template #trigger>
                              <div @mouseleave="() => { hover.delete = false }"
                                @mouseenter="() => { hover.delete = true }"
                                class="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] hover:dark:bg-[#3A3A3C]">
                                <div v-if="vantTheme === 'light'">
                                  <img v-show="!hover.delete"
                                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-delete.png"
                                    class="w-[20px]" alt="">
                                  <img v-show="hover.delete"
                                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-delete_active.png"
                                    class="w-[20px]" alt="">
                                </div>

                                <div v-if="vantTheme === 'dark'">
                                  <img v-show="!hover.delete"
                                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-delete.png"
                                    class="w-[20px]" alt="">
                                  <img v-show="hover.delete"
                                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-delete_active.png"
                                    class="w-[20px]" alt="">
                                </div>
                              </div>

                            </template>
                            {{ $t('chat.deleteHistoryConfirm') }}
                          </NPopconfirm>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </CheckboxGroup>
        <div class="h-[94px] relative">
          <div class="h-[94px] fixed w-[100%] left-[0px] bottom-[0px] bg-[#fff] z-10 dark:bg-[#212121]" v-if="isDelete">
            <div class="flex items-center relative m-auto border-[#E9EBF4] dark:border-[#6A6A6A]" style="
          width: 342px;
          height: 53px;
          border-radius: 11px;
          border-width: 1px;
          border-style: solid;
          ">
              <div class="absolute left-[50%] top-[50%] bg-[#E9EBF4] dark:bg-[#6A6A6A]" style="
            width: 2px;
            height: 16px;
            border-radius: 11px;
            margin-left: -1px; 
            margin-top: -8px;
            "></div>
              <div
                class="cursor-pointer flex items-center justify-center   text-[#818894]  hover:text-[#3875F6] dark:text-[#8E8E8E] dark:hover:text-[#fff]"
                style="width: 50%; text-align: center;" @mouseleave="() => { hover.close = false }"
                @mouseenter="() => { hover.close = true }" @click="handleInfoCancel">
                <div v-if="vantTheme === 'light'" class="mr-[6px]">
                  <img v-show="!hover.close"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-close.png"
                    class="w-[33px]" alt="">
                  <img v-show="hover.close"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-close_active.png"
                    class="w-[33px]" alt="">
                </div>
                <div v-if="vantTheme === 'dark'" class="mr-[6px]">
                  <img v-show="!hover.close"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-close.png"
                    class="w-[33px]" alt="">
                  <img v-show="hover.close"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-close_active.png"
                    class="w-[33px] " alt="">
                </div>
                <span>取消选择</span>
              </div>
              <div
                class="cursor-pointer flex items-center justify-center text-[#818894] hover:text-[#3875F6] dark:text-[#8E8E8E] dark:hover:text-[#fff]"
                style="width: 50%; text-align: center;" @mouseleave="() => { hover.save = false }"
                @mouseenter="() => { hover.save = true }" @click="emit('save')">
                <div v-if="vantTheme === 'light'" class="mr-[6px]">
                  <img v-show="!hover.save"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-choose.png" alt=""
                    class="w-[32px] ">
                  <img v-show="hover.save"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-choose_active.png"
                    alt="" class="w-[32px]">
                </div>
                <div v-if="vantTheme === 'dark'" class="mr-[6px]">
                  <img v-show="!hover.save"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-choose.png" alt=""
                    class="w-[32px]">
                  <img v-show="hover.save"
                    src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-choose_active.png"
                    alt="" class="w-[32px]">
                </div>

                <span>删除已选</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>

<style lang="less" scoped>
.question-list {
  // height: 75px;
  border-bottom: 1px solid;

  .input-title {
    width: 100%;
    height: 32px;
    background-color: transparent;
    // background: #FFFFFF;
    border-radius: 5px;
    // border: 1px solid #3875F6;
    border-width: 1px;
    border-style: solid;
    box-sizing: border-box;
    padding: 0 10px;
  }

  &:hover {
    .title {
      opacity: 0.8;
    }

  }
}
</style>
