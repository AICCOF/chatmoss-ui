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

    <div class="main-bg">
      <div v-for="(item, i) of myList" :key="i" class="flex justify-between items-center w-full flex-1 item">
        <div class="flex items-center flex-1">
          <div class="mr-2 none">
            <img :src="item.icon" alt="">
          </div>
          <div class="flex flex-1 w-full">
            <span class="mr-2 flex justify-center text-base none" style="width:30px">{{ i + 1 }}</span>
            <div class="w-full pr-4 flex-1">
              <div class="flex  items-center w-full">
                <span class="text-base mr-4 " >{{ item.appName }}</span>
                <span style="cursor: pointer;">
                  <!-- <van-icon name="like-o" style="color:red;" /> -->
                  <van-icon name="like" style="color:red;" /><span style="margin-left: 4px;">{{ item.likeCountStr
                  }}</span>
                </span>
              </div>
              <div class="text-sm ">
                {{ item.desc }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex">
          <div  class="mr-2 btns normal" @click="handleEdit(item)">
            编辑
          </div>
          <div class="btns danger" type="danger" @click="handleDelete(item)">
            删除
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped lang="less">
.item {
  padding: 6px 20px;
  cursor: pointer;
  min-height: 7rem;
  background: var(--moss-header-color);
  border-radius: 8px;
  margin-top: 10px;
  img{
    width: 40px;
    height: 40px;
  }
}
</style>