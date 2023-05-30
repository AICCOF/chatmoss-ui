<script lang="ts" setup>
import { NPopover, NTag, useMessage } from 'naive-ui'
import { useUserStore } from '@/store'
// import { computed } from 'vue'
// import { ref } from 'vue'
const userStore = useUserStore()
const ms = useMessage()

// 新建对话
function createQuestion() {
  const questionBtnDom = document.querySelector('#question-btn') as HTMLDivElement
  questionBtnDom.click()
  ms.success('新建会话成功，请提问~')
}

// 历史记录
function toggleButtonEvent() {
  const toggleButton = document.querySelector('.n-layout-toggle-button') as HTMLDivElement
  toggleButton.click()
}

function setOpenaiVersion() {
  userStore.saveOpenaiVersion(userStore.getOpenaiVersion === '3.5' ? '4.0' : '3.5')
  ms.success('模型切换成功')
}
</script>

<template>
  <div>
    <header class="footer-main">
      <div class="footer-left">
        <NTag class="footer-item footer-item-btn footer-item-btn1" type="success" @click="createQuestion">
          新建会话
        </NTag>
        <NTag class="footer-item footer-item-btn footer-item-btn2" type="success" @click="toggleButtonEvent">
          历史记录
        </NTag>
      </div>
      <div class="footer-right">
        <div class="footer-item">
          <div class="header-right-item header-right-item-help">
            <NPopover trigger="hover">
              <template #trigger>
                <NTag type="success" size="small" class="footer-item footer-item-btn footer-item-btn1" @click="setOpenaiVersion">
                  GPT-{{ userStore.getOpenaiVersion }}
                </NTag>
              </template>
              切换模型
            </NPopover>
          </div>
        </div>
      </div>
    </header>
  </div>
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
	// max-width: 1280px;
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
		// background-color: #3872e0;
	}
}

.wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	z-index: 10000;
}

.wrapper-mian {
	width: 375px;
	height: 85vh;
	border-radius: 10px;
	transform: scale(0.95);

	iframe {
		width: 375px;
		height: 80vh;
	}
}
</style>

<style>
.van-overlay {
	z-index: 1000;
}
</style>
