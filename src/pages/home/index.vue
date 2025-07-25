<!--
 * @Author: Chensd ”851329628@qq.com“
 * @Date: 2025-07-25 10:10:29
 * @LastEditors: Chensd ”851329628@qq.com“
 * @LastEditTime: 2025-07-25 10:13:02
 * @FilePath: \web-bl\src\pages\home\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import { queryProse } from '@/api'

const messages = ref<string>('')

function pull() {
  queryProse().then(({ code, result }) => {
    if (code === 0)
      messages.value = result
  })
}
</script>

<template>
  <div class="data-label">
    {{ $t('mock.fromAsyncData') }}
  </div>

  <div class="data-content bg-white dark:bg-[--van-background-2]">
    <div v-if="messages">
      {{ messages }}
    </div>
    <VanEmpty v-else :description="$t('mock.noData')" />
  </div>

  <van-space class="m-10" direction="vertical" fill>
    <VanButton type="primary" round block @click="pull">
      {{ $t('mock.pull') }}
    </VanButton>
    <VanButton type="default" round block @click="messages = ''">
      {{ $t('mock.reset') }}
    </VanButton>
  </van-space>
</template>

<route lang="json5">
{
  name: 'newHome',
}
</route>

<style lang="less" scoped>
.data-label {
  color: #969799;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  margin-top: 10px;
}

.data-content {
  height: 300px;
  padding: 20px;
  line-height: 30px;
  margin-top: 20px;
  font-size: 16px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
