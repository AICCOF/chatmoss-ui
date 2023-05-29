<script lang="ts" setup>
import draggable from 'vuedraggable'
import { nextTick, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useMessage } from 'naive-ui'
import { useGo } from '@/utils/router'
import { getApplicationInstall, getApplicationSort } from '@/api/application'
import { useChatStore, useUserStore } from '@/store'

const ms = useMessage()

const go = useGo()
const userStore = useUserStore()
const chatStore = useChatStore()
const enabled = ref(false)

const deleteItem = ref([])

userStore.getApplicationInstallListAPI()

function handleEdit() {
  enabled.value = true
}
function handleClick(row) {
  if (!enabled.value){
		userStore.setAppId(row.appId)
		nextTick(() => {
			chatStore.chatList()
			// ms.warning('切换应用成功,请新建会话或者选中历史会话在提问')
		})
	}
   
}
function handleDelete(row, i) {
  deleteItem.value.push(i)
  userStore.appList.installList.splice(i, 1)
}

function handleSave() {
  showConfirmDialog({
    title: '保存',
    message:
			'确定进行此操作?',
  })
    .then(async () => {
      // on confirm
      const data = list.value.installList.map((row, index) => {
        return {
          appId: row.appId,
          sort: index + 1,
        }
      })
      const res = await getApplicationSort(data)

      if (deleteItem.value.length > 0) {
        await getApplicationInstall({
          appId: deleteItem.value.join(','),
          installed: 1,
        })
      }

      deleteItem.value = []
      getApplicationInstallListAPI()
      showToast(res.msg)
    })
    .catch(() => {
      // on cancel
    })

  enabled.value = false
}
</script>

<template>
  <div class="wrap">
    <div class="list">
      <draggable :list="userStore.appList.systemList" :disabled="true" item-key="name" class="list-group" ghost-class="ghost">
        <template #item="{ element }">
          <div
            class="img" :class="[userStore.appIdValue === element.appId ? 'active' : '']"
            @click="handleClick(element)"
          >
            <span class="span"> {{ element.appId }}</span>
            <div>
              <img :src="element.iconUrl" alt="">
            </div>
          </div>
        </template>
      </draggable>
      <draggable :list="userStore.appList.installList" :disabled="!enabled" item-key="name" class="list-group" ghost-class="ghost">
        <template #item="{ element, index }">
          <div
            class="img" :class="[userStore.appIdValue === element.appId ? 'active' : '']"
            @click="handleClick(element)"
          >
            <span v-if="enabled" class="close" @click="handleDelete(element, index)">
              <van-icon name="cross" />
            </span>
            <span class="span"> {{ element.appId }}</span>
            <div :class="[enabled ? 'animate-pulse animate' : '']">
              <img :src="element.iconUrl" alt="">
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="btns">
      <div class="btn">
        <van-icon v-if="!enabled" name="edit" @click="() => handleEdit()" />
        <span v-if="enabled" style="font-size: 12px;" @click="() => handleSave()">保存</span>
      </div>
      <div class="btn">
        <van-icon name="plus" @click="() => { go({ name: 'application' }) }" />
      </div>
    </div>
  </div>
</template>

<style>
@keyframes pulse {

	0%,
	100% {
		transform: rotate(0deg);
	}

	25% {
		transform: rotate(-10deg);
	}

	50% {
		transform: rotate(0deg);
	}

	75% {
		transform: rotate(10deg);
	}

}
</style>

<style scoped lang="less">
.wrap {
	height: 95%;
	width: 45px;
	border-right: 0.5px solid rgba(145, 158, 171, .16);
	border-bottom: 0.5px solid rgba(145, 158, 171, .16);
	box-sizing: border-box;
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;

	.list {
		width: 45px;
		height: 80%;

		.img {
			margin: 0 auto;
			position: relative;
			width: 45px;
			height: 45px;
			margin-top: 10px;
			// background: linear-gradient(270deg, #323337 50%, rgba(70, 79, 111, 0.5) 100%);
			// box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.05);
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			&:hover {
				background: linear-gradient(270deg, #323337 50%, rgba(70, 79, 111, 0.5) 100%);
				box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.05);
			}

			img {
				width: 26px;
				height: 26px
			}

			&.active {
				background-color: rgba(90, 90, 90, 0.2)
			}

			.animate {
				animation-duration: 0s !important;
			}

			.close {
				position: absolute;
				top: -10px;
				left: 5px;
			}

			.span {
				position: absolute;
				right: 0px;
				bottom: 0px;
				color: #fff;
				opacity: 0.5;
				font-size: 12px;
				transform: scale(0.6);
			}

		}
	}

	.btns {
		height: 20%;
		font-size: 24px;

		.btn {
			width: 45px;
			height: 45px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			&:hover {
				background: linear-gradient(270deg, #323337 50%, rgba(70, 79, 111, 0.5) 100%);
				box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), inset 0px 1px 0px rgba(255, 255, 255, 0.05);
			}
		}
	}

}
</style>
