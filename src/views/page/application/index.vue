<script lang="ts" setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
import { getApplicationInstall, getApplicationLike, getApplicationList, getApplicationSearch, getApplicationTypeList } from '@/api/application'
const ms = useMessage()
const back = useBack()
const go = useGo()
const value = ref('')
const flag = ref(true)
const active = ref(0)
const typeList = ref('')
const dataList = ref([])

async function getApplicationListAPI(appType) {
  const res = await getApplicationList({
    appType,
    pageNum: 1,
    pageSize: 1000,
  })
  dataList.value = res.rows || []
}

async function getApplicationSearchAPI(appType) {
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
    <div class="flex justify-center justify-around mt-4">
      <van-button type="primary" style="width:40%" @click="() => { go({ name: 'createApp' }) }">
        创建新的应用
      </van-button>
      <van-button type="success" style="width:40%" @click="() => { go({ name: 'appList' }) }">
        查看创建的应用
      </van-button>
    </div>

    <div class="mt-4 flex items-center">
      <van-search v-model="value" class="flex-1 button-t1" placeholder="搜索应用" show-action :clearable="false" @search="getApplicationSearchAPI">
        <template #action>
          <van-button size="small" type="primary" @click="getApplicationSearchAPI">
            搜索
          </van-button>
        </template>
      </van-search>
    </div>

    <div class="flex">
      <van-sidebar v-if="flag" v-model="active" style class="sidebar" @change="handleChange">
        <van-sidebar-item v-for="(row, i) of typeList" :key="i" :title="row.typeName" />
      </van-sidebar>
      <div class="mt-4  flex-1 pl-4 w-full content">
        <div
          v-for="(item, i) of dataList" :key="i"
          class="flex justify-between items-center  dark:text-white w-full flex-1 item"
        >
          <div class="flex items-center flex-1">
            <div class="mr-2">
              <img :src="item.icon" alt="" style="width:30px;height: 30px;">
              <!-- <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo/logo1.png" alt="" style="width:30px;height: 30px;"> -->
            </div>
            <div class="flex flex-1 w-full">
              <span class="mr-2 flex justify-center text-base text-center" style="width:30px">{{ i + 1 }}</span>
              <div class="w-full pr-4 flex-1">
                <div class="flex  items-center w-full">
                  <span class="text-base mr-4">{{ item.appName }}</span>
                  <span style="cursor: pointer;" @click="handleLike(item)">
                    <van-icon v-if="item.liked === 0" name="like-o" style="color:red;" />
                    <van-icon v-if="item.liked === 1" name="like" style="color:red;" /><span style="margin-left: 4px;">{{ item.likeCountStr
                    }}</span>
                  </span>
                </div>
                <div class="text-sm">
                  {{ item.desc }}
                </div>
              </div>
            </div>
          </div>
          <div @click="handleInstalled(item)">
            <van-button v-if="item.installed === 0" type="primary" size="mini">
              安装
            </van-button>
            <van-button v-if="item.installed === 1" type="danger" size="mini">
              卸载
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>


<style lang="less" scoped>
.content{
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.sidebar{
  height: calc(100vh - 200px);
  overflow-y: auto;
}
.item {
  @apply hover:bg-[#eaeaea];
	padding: 6px 20px;
	cursor: pointer;
  min-height: 7rem;
  
  @apply hover:dark:bg-[#1c1c1e];
}


/deep/ .van-search__action {
	margin-top: -10px;
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
