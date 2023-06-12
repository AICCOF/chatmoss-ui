<template>
  <div>
    <div class="header">
      <slot name="title" />
    </div>
    <div class="pages">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.header {
  box-sizing: border-box;
  // padding: 0 20px;
  position: fixed;
  // height: 40px;
  width: 100%;
  z-index: 100;
  max-width: 750px;
  // display: flex;
  // background-color: white;
  // align-items: center;
  // justify-content: space-between;

  .title {
    text-align: center
  }

}

.pages {
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  // padding:0 8px;
  padding-top: 46px;
}
</style>
