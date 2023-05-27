<script lang="ts" setup>
import { useGo } from '@/utils/router'

const go = useGo()

</script>
<template>
  <div >
    <div class="list">
      <div>icon1</div>
      <div>icon2</div>
      <div>icon3</div>
    </div>
    <div class="btn">
      <span @click="()=>{ go({name:'application'})}">添加</span>
    </div>
  </div>
</template>

<style>

.list{
  height: 80%;
}
.btn{
  height: 20%;
}
</style>