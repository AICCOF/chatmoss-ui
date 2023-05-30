<script lang="ts" setup>
import { showConfirmDialog, showToast } from 'vant'
import { ref } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
import { getApplicationDelete, getApplicationMy } from '@/api/application'
const back = useBack()
const go = useGo()
const myList = ref([])
async function getApplicationMyAPI() {
  const res = await getApplicationMy()

  myList.value = res.rows || []
}

getApplicationMyAPI()

async function handleDelete(row) {
  showConfirmDialog({
    title: '删除',
    message:
      '确认删除?',
  })
    .then(async () => {
      // on confirm
      const res = await getApplicationDelete(row.id)
      getApplicationMyAPI()
      showToast(res.msg)
    })
    .catch(() => {
      // on cancel
    })
}

async function handleEdit(row) {
  go({
    name: 'createApp',
    query: { id: row.id },
  })
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="应用列表" left-text="返回" left-arrow @click-left="back" />
    </template>

    <div class="mt-4  flex-1 pl-4 w-full wrap-main">
      <div v-for="(item, i) of myList" :key="i" class="flex justify-between items-center  dark:text-white w-full flex-1 item">
        <div class="flex items-center flex-1">
          <div class="mr-2">
            <img :src="item.icon" alt="" style="width:30px;height: 30px;">
          </div>
          <div class="flex flex-1 w-full">
            <span class="mr-2 flex justify-center text-base" style="width:30px">{{ i + 1 }}</span>
            <div class="w-full pr-4 flex-1">
              <div class="flex  items-center w-full">
                <span class="text-base mr-4">{{ item.appName }}</span>
                <span style="cursor: pointer;">
                  <!-- <van-icon name="like-o" style="color:red;" /> -->
                  <van-icon name="like" style="color:red;" /><span style="margin-left: 4px;">{{ item.likeCountStr
                  }}</span>
                </span>
              </div>
              <div class="text-sm">
                {{ item.desc }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <van-button type="primary" size="mini" class="mr-2" @click="handleEdit(item)">
            编辑
          </van-button>
          <van-button size="mini" type="danger"  @click="handleDelete(item)">
            删除
          </van-button>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped lang="less">



.item {
  @apply hover:bg-[#eaeaea];
	padding: 6px 20px;
	cursor: pointer;
  min-height: 7rem;
  
  @apply hover:dark:bg-[#1c1c1e];
}


</style>