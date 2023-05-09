<script lang="ts" setup>
import { useMessage } from 'naive-ui'
// import { computed } from 'vue'
// import { useChatStore, useUserStore } from '@/store'

const ms = useMessage()

// const userStore = useUserStore()
// const chatStore = useChatStore()
// const dataSources = computed(() => chatStore.getChatByUuid())

// 新建对话
function createQuestion() {
  const questionBtnDom = document.querySelector('#question-btn') as HTMLDivElement
  questionBtnDom.click()
  ms.success('新建会话成功，请提问~')
}
// 问题反馈
// function questionPushEvent() {
//   const questionBtnDom = document.querySelector('.setting-main1') as HTMLDivElement
//   questionBtnDom.click()
//   setTimeout(() => {
//     const questionBtnDom = document.querySelector('#question-push') as HTMLDivElement
//     questionBtnDom.click()
//   }, 100)
// }
// 历史记录
function toggleButtonEvent() {
  const toggleButton = document.querySelector('.n-layout-toggle-button') as HTMLDivElement
  toggleButton.click()
}
</script>

<template>
  <header
    class="footer-main"
  >
    <div class="footer-left">
      <div class="footer-item footer-item-btn" @click="createQuestion">
        新建会话
      </div>
      <div class="footer-item footer-item-btn" @click="toggleButtonEvent">
        历史记录
      </div>
      <!-- <div class="footer-item footer-item-btn">
        提示词
      </div> -->
    </div>
    <div class="footer-right">
      <!-- <div v-if="userStore.packageList[0]?.timesResidue === 0 && userStore.packageList[1]?.timesResidue === 0" class="consumption-text">
        下次预计消耗：{{ dataSources.map(item => item.text).join('\n').length }}
      </div> -->
      <div class="footer-item">
        <div class="header-right-item">
          <!-- <NPopover trigger="hover">
            <template #trigger>
              <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v3.0/img12.png" alt="" @click="questionPushEvent">
            </template>
            <span>问题反馈</span>
          </NPopover> -->
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="less">
.consumption-text {
	white-space: nowrap;
	width: 200px;
	font-size: .75rem;
  line-height: 1rem;
	color: rgb(209 213 219);
	text-align: right;
	font-style: italic;
}
.footer-main {
	max-width: 1280px;
	width: 100%;
	min-width: 250px;
	overflow: scroll;
	position: fixed;
	display: flex;
	align-items: center;
	height: 40px;
	min-height: 40px;
	max-height: 40px;
	// padding: 0 10px;
	padding-left: 0.5rem;
	user-select: none;
	backdrop-filter: blur(20px);
	// background-color: rgba(60, 128, 253, 0.05);
	z-index: 20;
	bottom: 88px;
	position: absolute;
  left: 50%;
  transform: translateX(-50%);
	.footer-left {
		width: 60%;
		display: flex;
	}
	.footer-right {
		width: 40%;
		display: flex;
		justify-content: flex-end;
	}
	.footer-item {
		margin-right: 20px;
		cursor: pointer;
		&:active {
			transform: scale(.96);
		}
		img {
			width: 20px;
			height: 20px;
		}
	}
	.footer-item-btn {
		display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    height: 26px;
    padding: 0 6px;
    border-radius: 4px;
		margin-right: 8px;
		background-color: #3872e0;
	}
}
</style>
