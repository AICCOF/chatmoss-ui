<script setup lang="ts">
import { ref } from 'vue'
import {
  useMessage,
} from 'naive-ui'

const prop = withDefaults(defineProps<Props>(), {
  sort: 0,
})

const emit = defineEmits(['success', 'update:sort'])

const ms = useMessage()

interface Props {
  paperList: Chat.paper[]
  sort: number
}
const current = ref<number>()
const disabled = ref<boolean>(false) // 禁用选项事件
const onChangeAnswer = (i: number) => {
  if (disabled.value)
    return

  current.value = i
  disabled.value = true

  if (current.value === prop.paperList[prop.sort].answerIndex) {
    ms.success('回答正确')

    if (prop.sort === prop.paperList.length - 1) {
      emit('success')
    }
    else {
      setTimeout(() => {
        emit('update:sort', prop.sort + 1)
        current.value = undefined
        disabled.value = false
      }, 2000)
    }
  }
  else {
    ms.error('回答错误，思考下，5秒后可以继续作答')
    setTimeout(() => {
      current.value = undefined
      disabled.value = false
    }, 5000)
  }
}
</script>

<template>
  <div>
    <section class="header flex justify-between mb-5">
      <h1>{{ paperList[sort].title }}</h1>
      <span>{{ sort + 1 }}/{{ paperList.length }}</span>
    </section>
    <ul class="content">
      <li v-for="(answer, index) in paperList[sort].options" :key="index" class="answer" :class="{ active: current === index, disabled }" @click="onChangeAnswer(index)">
        {{ answer }}
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.answer {
	width: 100%;
	padding: 10px;
	height: auto;
	border: 1px solid #343839;
	border-radius: 6px;
	margin-bottom: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;

	&.active {
		background-color: #0099FF;
	}

	&.disabled {
		opacity: 0.5;
	}
}
</style>
