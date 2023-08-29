<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { Spin } from 'ant-design-vue'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
import { getApplicationInstall, getApplicationLike, getApplicationList, getApplicationSearch, getApplicationTypeList } from '@/api/application'
import { useScrollToBottom } from '@/utils/usePullDownRefresh'
const ms = useMessage()
const back = useBack()
const go = useGo()
const value = ref('')
const flag = ref(true)
const active = ref(0)
const typeList = ref('')
const dataList = ref([])
let currentAppType: string
const element = ref()
const spinning = ref<boolean>(false)
let parmas = {
  appType: '',
  pageNum: 1,
  pageSize: 20,
}
let stop = false
async function getApplicationListAPI(appType) {
  if (currentAppType != appType) {
    currentAppType = appType
    parmas = {
      appType,
      pageNum: 1,
      pageSize: 20,
    }
    spinning.value = true
    const res = await getApplicationList(parmas)
    dataList.value = res.rows || []
    spinning.value = false
    stop = false
    if (res.rows.length != parmas.pageSize)
      stop = true
  }
  else {
    if (stop)
      return
    parmas.pageNum++
    spinning.value = true
    const res = await getApplicationList(parmas)
    spinning.value = false
    dataList.value = [...dataList.value, ...res.rows] || []
    if (res.rows.length != parmas.pageSize)
      stop = true
  }
}
useScrollToBottom(element, async () => {
  getApplicationListAPI(currentAppType)
})
onMounted(() => {

})

async function getApplicationSearchAPI() {
  if (value.value) {
    const res = await getApplicationSearch(value.value)
    dataList.value = res.rows || []
    flag.value = false
  }
  else {
    getApplicationListAPI(typeList.value[active.value].id)
    flag.value = true
  }
}

function handleChange(index: number) {
  getApplicationListAPI(typeList.value[index].id)
}
// getApplicationListAPI();
getApplicationTypeListAPI()
async function getApplicationTypeListAPI() {
  const res = await getApplicationTypeList()
  typeList.value = ([{ id: '', typeName: '全部' }, ...res.list] || [])
  active.value = 0
  getApplicationListAPI(typeList.value[active.value].id)
}
async function handleLike(row) {
  console.log('', row.liked)
  ms.success(row.liked === 1 ? '已取消点赞，点赞结果一分钟后更新' : '点赞成功，点赞结果一分钟后更新')
  const res = await getApplicationLike({
    appId: row.id,
    type: row.liked === 0 ? 1 : 0,
  })

  row.liked = row.liked === 0 ? 1 : 0
}

async function handleInstalled(row) {
  ms.success(row.installed === 1 ? '卸载成功' : '安装成功')
  await getApplicationInstall({
    appId: row.id,
    type: row.installed === 0 ? 1 : 0,
  })
  row.installed = row.installed === 0 ? 1 : 0
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="应用商店" left-text="返回" left-arrow @click-left="back" />
    </template>
    <div class="wrap-main">
      <div class="flex justify-center justify-around mt-4">
        <div class="btn" @click="() => { go({ name: 'createApp' }) }">
          创建新的应用
        </div>
        <div class="btn" @click="() => { go({ name: 'appList' }) }">
          查看创建的应用
        </div>
      </div>

      <div class="mt-2 flex items-center m-auto mb-0" style="width:90%">
        <van-search
          v-model="value" class="flex-1 button-t1 overflow-hidden" placeholder="搜索应用" show-action
          :clearable="false" style="border-radius: 40px;" @search="getApplicationSearchAPI"
        >
          <template #action>
            <!-- <van-button size="small" type="primary" @click="getApplicationSearchAPI">
              搜索
            </van-button> -->
          </template>
        </van-search>
      </div>

      <div class="flex main mt-0">
        <van-sidebar v-if="flag" v-model="active" class="sidebar" @change="handleChange">
          <van-sidebar-item v-for="(row, i) of typeList" :key="i" :title="row.typeName" />
        </van-sidebar>
        <div class="pt-0 flex-1" style="overflow: hidden;">
          <div ref="element" class="w-full content px-8 pt-0 border-box">
            <div v-for="(item, i) of dataList" :key="i" class="flex justify-between items-center w-full flex-1 item mt-2">
              <div class="flex items-center flex-1">
                <div class="mr-2 none">
                  <img :src="item.icon" class="img" alt="" style="">
                </div>
                <div class="flex flex-1 w-full">
                  <span class="mr-2 flex justify-center text-base text-center none" style="width:30px">{{ i + 1 }}</span>
                  <div class="w-full pr-4 flex-1">
                    <div class="flex  items-center w-full">
                      <span class="text-base mr-4  item-min-width">{{ item.appName }}</span>
                      <span style="cursor: pointer;" @click="handleLike(item)">
                        <van-icon v-if="item.liked === 0" name="like-o" style="color:red;" />
                        <van-icon v-if="item.liked === 1" name="like" style="color:red;" /><span
                          style="margin-left: 4px;"
                        >{{ item.likeCountStr
                        }}</span>
                      </span>
                    </div>
                    <div class="text-sm  item-desc-min-width">
                      {{ item.desc }}
                    </div>
                  </div>
                </div>
              </div>
              <div @click="handleInstalled(item)">
                <div v-if="item.installed === 0" class="btns normal">
                  安装
                </div>
                <div v-if="item.installed === 1" class="btns danger">
                  卸载
                </div>
              </div>
            </div>
            <div class="flex-center justify-center" style="margin-top:40px;">
              <Spin :spinning="spinning" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="less">
.van-sidebar-item {
  background-color: var(--moss-header-color);

  &.van-sidebar-item--select {
    background-color: var(--moss-bg-content-color);
  }
}
</style>

<style lang="less" scoped>
.main {
  background-color: var(--moss-bg-content-color);
}

.wrap-main {
  min-height: 100%;
  // background-color: var(--moss-header-color);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.btn {
  background: var(--moss-header-color);
  border: 1px solid #6B83FF;
  border-radius: 7px;
  color: #6B83FF;
  width: 165px;
  height: 40px;
  text-align: center;
  line-height: 40px;
}

.content {
  height: calc(100vh - 165px);
  overflow-y: auto;
}

.sidebar {
  height: calc(100vh - 170px);
  overflow-y: auto;
  width: 64px;
  flex: 0 0 64px;
  // background-color: white;
}

/* 隐藏滚动进度条 */
::-webkit-scrollbar {
  display: none;
}

.item {
  background: var(--moss-header-color);
  border-radius: 15px;
  padding: 6px 20px;
  cursor: pointer;
  min-height: 7rem;
  color: var(--moss-text);

  .img {
    width: 40px;
    height: 40px;
    background: var(--moss-header-color);
    border: 1px solid var(--moss-border-color);
    border-radius: 50%;
  }
}

/deep/ .van-search__action {
  margin-top: -10px;
}

/deep/ .van-search__content {
  border-radius: 40px;
}

.text-center {
  display: flex;
  align-items: center;
}

.text-sm {
  font-size: 12px;
  // color: #fff;
  opacity: .8;
  margin-top: 4px;
}
</style>
