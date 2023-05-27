<script lang="ts" setup>
import { useMessage } from 'naive-ui'
// import { computed } from 'vue'
import { ref } from 'vue'

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

const show = ref(false)
</script>

<template>
  <div>
    <header
      class="footer-main"
    >
      <div class="footer-left">
        <div class="footer-item footer-item-btn footer-item-btn1" @click="createQuestion">
          新建会话
        </div>
        <div class="footer-item footer-item-btn footer-item-btn2" @click="toggleButtonEvent">
          历史记录
        </div>
      </div>
      <div class="footer-right">
        <!-- <div class="footer-item" @click="show = true">
          <div class="header-right-item header-right-item-help">
            <NPopover trigger="hover">
              <template #trigger>
                <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v3.0/img12.png" alt="">
              </template>
              <span>ChatMoss帮助中心</span>
            </NPopover>
          </div>
        </div> -->
      </div>
    </header>
    <van-overlay :show="show" style="z-index:100" @click="show = false">
      <div class="wrapper">
        <div class="wrapper-mian">
          <iframe src="https://h5.aihao123.cn/pages/app/help/index.html" frameborder="0" />
        </div>
      </div>
    </van-overlay>
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
