<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack, useGo } from '@/utils/router'
import { ref } from 'vue'
import { getApplicationList } from '@/api/application'
import { getApplicationTypeList, getApplicationInstall, getApplicationLike, getApplicationSearch } from '@/api/application'
const back = useBack()
const go = useGo()
const value = ref('');
const flag = ref(true);
const active = ref(0);
const typeList = ref('');
const dataList = ref([]);

async function getApplicationListAPI(appType) {
  let res = await getApplicationList({
    appType,
    pageNum: 1,
    pageSize: 1000
  });
  dataList.value = res.rows || [];
}

async function getApplicationSearchAPI(appType) {
  if (value.value) {
    let res = await getApplicationSearch(value.value);
    dataList.value = res.rows || [];
    flag.value = false;
  } else {
    getApplicationListAPI(typeList.value[active.value].id)
    flag.value = true;
  }

}

function handleChange(index: number) {
  getApplicationListAPI(typeList.value[index].id)
}
// getApplicationListAPI();
getApplicationTypeListAPI();
async function getApplicationTypeListAPI() {
  let res = await getApplicationTypeList();
  typeList.value = (res.list || [])
  active.value = 0;
  getApplicationListAPI(typeList.value[active.value].id)
}
async function handleLike(row) {
  let res = await getApplicationLike({
    appId: row.id,
    type: row.liked === 0 ? 1 : 0
  })

  row.liked = row.liked === 0 ? 1 : 0;
}

async function handleInstalled(row) {
  await getApplicationInstall({
    appId: row.id,
    type: row.installed === 0 ? 1 : 0
  })
  row.installed = row.installed === 0 ? 1 : 0;
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="应用商店" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>
    <div class="flex justify-center justify-around mt-4">
      <van-button type="primary" style="width:40%" @click="() => { go({ name: 'createApp' }) }">创建应用</van-button>
      <van-button type="success" style="width:40%" @click="() => { go({ name: 'appList' }) }">查看自己创建的应用</van-button>
    </div>

    <div class="mt-4 flex items-center">
      <van-search v-model="value" class="flex-1" placeholder="搜索应用" @search="getApplicationSearchAPI" show-action>
        <template #action>
          <div @click="getApplicationSearchAPI">搜索</div>
        </template>
      </van-search>
    </div>

    <div class="flex">
      <van-sidebar v-model="active" @change="handleChange" v-if="flag">
        <van-sidebar-item :title="row.typeName" v-for="(row, i) of typeList" :key="i" />
      </van-sidebar>
      <div class="mt-4  flex-1 pl-4 w-full">
        <div class="flex justify-between items-center  dark:text-white w-full flex-1 item" v-for="(item, i) of dataList"
          :key="i">
          <div class="flex items-center flex-1">
            <div class="mr-2">
              <img :src="item.icon" alt="" style="width:30px;height: 30px;">
            </div>
            <div class="flex flex-1 w-full">
              <span class="mr-2 flex justify-center text-base" style="width:30px">{{ i + 1 }}</span>
              <div class="w-full pr-4 flex-1">
                <div class="flex  items-center w-full">
                  <span class="text-base mr-4">{{ item.appName }}</span>
                  <span @click="handleLike(item)">
                    <van-icon name="like-o" style="color:red;" v-if='item.liked === 0' />
                    <van-icon name="like" style="color:red;" v-if='item.liked === 1' /><span>{{ item.likeCountStr
                    }}</span>
                  </span>
                </div>
                <div class="text-sm">{{ item.desc }}</div>
              </div>
            </div>
          </div>
          <div @click="handleInstalled(item)">
            <van-button type="primary" size="mini" v-if='item.installed === 0'>安装</van-button>
            <van-button type="primary" size="mini" v-if='item.installed === 1'>卸载</van-button>
          </div>
        </div>

      </div>
    </div>

  </Page>
</template>
<style scoped>
.item {
  height: 50px;
}
</style>
