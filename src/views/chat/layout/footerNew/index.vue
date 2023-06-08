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
		<footer class="footer-main">
			<div class="footer-left">
				<div class="footer-item footer-item-btn footer-item-btn1" @click="createQuestion">
					新建会话
				</div>
				<div class="footer-item footer-item-btn footer-item-btn2" @click="toggleButtonEvent">
					历史记录
				</div>
			</div>
			<div class="footer-right">
				<div class="footer-item" style="margin-right: 0px;">
					<div class="header-right-item header-right-item-help">
						<NPopover trigger="hover">
							<template #trigger>
								<div class="footer-item footer-item-btn footer-item-btn1" style="margin-right: 0px;" @click="setOpenaiVersion" >
									GPT-{{ userStore.getOpenaiVersion }}
								</div>
							</template>
							切换模型
						</NPopover>
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>

<style lang="less">


.footer-main {
	width: 100%;
	min-width: 250px;
	overflow: scroll;
	display: flex;
	align-items: center;
	padding-left: 0.5rem;
	user-select: none;
	backdrop-filter: blur(20px);
	background-color: var(--moss-bg-content-color);
	z-index: 20;

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
		background: var(--moss-bg-btn-color);
		border-radius: 27px;
		color:var(--moss-text-ask-color);
		padding: 4px 10px;
		margin-bottom: 11px;
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
