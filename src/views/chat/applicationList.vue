<script lang="ts" setup>
import { useGo } from '@/utils/router'
import draggable from 'vuedraggable'
import { ref } from 'vue'
const go = useGo()

let enabled = ref(false);
let list = ref([
  { name: "John", id: 0 },
  { name: "Joao", id: 1 },
  { name: "Jean", id: 2 }
])
function handleEdit() {
  enabled.value = true;
}
function handleDelete(row,i){
  console.log(i)
  list.value.splice(i,1)
}

function handleSave() {
  enabled.value = false;
}

</script>
<template>
  <div class="wrap">
    <div class="list">
      <draggable :list="list" :disabled="!enabled" item-key="name" class="list-group" ghost-class="ghost">
        <template #item="{ element, index }">
          <div class="img">
            <span class="close" v-if="enabled"  @click="handleDelete(element, index)">
              <van-icon name="cross"/>
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
        <van-icon name="edit" @click="() => handleEdit()" v-if="!enabled" />
        <span @click="() => handleSave()" v-if="enabled" style="font-size: 12px;">保存</span>
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
  width: 40px;
  padding-top: 10px;
  border-right: 1px solid #bbbbbb;
}

.img {
  margin: 0 auto;
  position: relative;
  width: 30px;
  height: 30px;
  margin-top: 10px;

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
    right: 2px;
    bottom: -6px;
    color: white;
  }

}

.list {
  height: 80%;
}

.btns {
  height: 20%;
  font-size: 24px;
}

.btn {
  padding-left: 6px;
  box-sizing: border-box;
}
</style>