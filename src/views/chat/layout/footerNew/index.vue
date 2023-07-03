<script lang="ts" setup>
import { NPopover, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useChatStore, useUserStore } from '@/store'
import { conversationUpload } from '@/api/index'
import { computed } from 'vue'
const userStore = useUserStore()
const chatStore = useChatStore()
const ms = useMessage()
const popoverDom = ref()


const hidden = computed(() => {
	return location.search.indexOf('hiddenInput') > -1
})

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

async function jarvisEvent() {
	ms.success('上传中，请稍等，大概5~20秒上传完成')
	const res = await conversationUpload({
		conversationId: chatStore.active,
	})
	ms.success(res.msg)
}

function setOpenaiVersion(action) {
	userStore.saveOpenaiVersion(action)
	popoverDom.value.setShow(false)
	ms.success('模型切换成功')
}

function handleMode() {
	userStore.toggleMode()
}
// const showPopover = ref(false)
</script>

<template>
	<div>
		<footer class="footer-main">
			<div class="footer-left">
				<div class="div">
					<div class="div-wrap">
						<div v-if="!userStore.isQuestionMode" class="footer-item footer-item-btn footer-item-btn1"
							@click="createQuestion">
							新建会话
						</div>
						<div v-if="!userStore.isQuestionMode" class="footer-item footer-item-btn footer-item-btn2"
							@click="toggleButtonEvent">
							历史记录
						</div>
						<!-- <div v-if="userStore.toggleValue && !userStore.isQuestionMode"
							class="footer-item footer-item-btn footer-item-btn2" @click="jarvisEvent">
							对话上传个人资料库
						</div> -->
					</div>
				</div>
			</div>
			<div class="footer-right">
				<div class="footer-item footer-item-btn footer-item-btn1 model-version" @click="handleMode" v-if='hidden'>
					{{ userStore.toggleValue ? '正常模式' : '极简模式' }}
				</div>
				<div class="footer-item">
					<div class="header-right-item header-right-item-help">
						<NPopover trigger="hover" placement="left" ref="popoverDom">
							<template #trigger>
								<div v-if="userStore.getModeVersion" class="footer-item footer-item-btn footer-item-btn1 model-version">
									{{ userStore.getModeVersion.viewName }}
								</div>
							</template>
							<div>
								<div v-for="(item, i) of userStore.getModelList" :key="i" class="model-item"
									:class="[i < (userStore.getModelList.length - 1) ? 'line' : '']" @click="setOpenaiVersion(item)">
									<NPopover trigger="hover" placement="left" style="width: max-content;">
										<div class="flex">
											解释：{{ item.desc }}
										</div>
										<template #trigger>
											<div class="cursor">
												{{ item.viewName }}
											</div>
										</template>
									</NPopover>
								</div>
							</div>
						</NPopover>
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>

<style lang="less" scoped>
.model-item {
	padding: 3px 5px;
	cursor: pointer;
}

.line {
	border-bottom: 0.5px solid #3a3a3c;
}

.footer-main {
	width: 100%;
	min-width: 250px;
	// overflow: scroll;
	display: flex;
	align-items: center;
	padding: 0 0.5rem;
	user-select: none;
	backdrop-filter: blur(20px);
	background-color: var(--moss-bg-content-color);
	z-index: 20;

	.footer-left {
		width: 40%;
		display: flex;

		.div {
			display: block;
			overflow-x: auto;

			&::-webkit-scrollbar {
				width: 10px;
				height: 5px;
				/**/
			}

			&::-webkit-scrollbar-track {
				background-color: var(--moss-border-color);
				border-radius: 10px;
			}

			&::-webkit-scrollbar-thumb:hover {
				background: var(--moss-text-time-color);
				border-radius: 10px;
			}

			.div-wrap {
				width: max-content;

			}
		}
	}

	.footer-right {
		width: 60%;
		display: flex;
		justify-content: flex-end;
	}

	.footer-item {
		margin-right: 5px;
		cursor: pointer;
		display: inline-block;

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
		color: var(--moss-text-ask-color);
		padding: 2px 8px;
		margin-top: 5px;
		margin-bottom: 5px;
		font-size: 12px;

		&.model-version {
			background-color: var(--moss-bg-ask-color);
		}
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
