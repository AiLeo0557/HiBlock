<script setup lang="ts">
// import HelloWorld from "./components/HelloWorld.vue";
import { HButton, HiInput, HiSelect, HiDate } from "@hi-block/components";
import { defineHiDateConfig, HiDateOption } from "@hi-block/definitions";
import { ref } from "vue";
// console.log(a);
const input_value = ref("");
const date_options: HiDateOption = ["month", ["YYYY-MM", "YYYYMM"]];
const date_config = defineHiDateConfig(date_options);
const date_value = ref("");
</script>

<template>
  <div>
    <!-- <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a> -->
    <HButton type="success" size="large">自定义按钮</HButton>
    <hi-input v-model="input_value" placeholder="请输入内容" />
    <hi-select
      v-model="input_value"
      :multiple="true"
      :options="{
        // alias: ['value', 'label'],
        defaultOptions: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
          { label: '选项3', value: '3' },
        ],
      }"
      placeholder="请选择内容"
    />
    <hi-date v-model="date_value" v-bind="date_config.elConfig" />
    <hi-date v-model="date_value" type="season" />
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
