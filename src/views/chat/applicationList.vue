<script lang="ts" setup>
import draggable from 'vuedraggable'
import { ref } from 'vue'
import { useGo } from '@/utils/router'
const go = useGo()

const enabled = ref(false)
const list = ref([
  { name: 'John', id: '00001' },
  { name: 'Joao', id: '00002' },
  { name: 'Jean', id: '00003' },
])
function handleEdit() {
  enabled.value = true
}
function handleDelete(row, i) {
  console.log(i)
  list.value.splice(i, 1)
}

function handleSave() {
  enabled.value = false
}
</script>

<template>
  <div class="wrap">
    <div class="list">
      <draggable :list="list" :disabled="!enabled" item-key="name" class="list-group" ghost-class="ghost">
        <template #item="{ element, index }">
          <div class="img">
            <span v-if="enabled" class="close" @click="handleDelete(element, index)">
              <van-icon name="cross" />
            </span>
            <div :class="[enabled ? 'animate-pulse animate' : '']">
              <img src="./../chat/img/icon1.png" alt="">
              <span> {{ element.id }}</span>
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
	border-right: 0.5px solid rgba(145,158,171,.16);
	border-bottom: 0.5px solid rgba(145,158,171,.16);
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

			.animate {
				animation-duration: 0.2s !important;
			}

			.close {
				position: absolute;
				right: -5px;
				top: -10px;
			}

			span {
				position: absolute;
				left: 5px;
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
