/**
 * author: 杜朝辉
 * date: 2025-02-18 14:13:16
 * description: 监测元素是否挂载
 * @returns {boolean} 是否挂载
 * @params {string} id 元素id
 */
import { ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'

export function useElementMounted<T extends HTMLElement>(id: string) {
  // 定义一个响应式变量，用于判断元素是否已挂载
  const isMounted = ref(false)
  // 在组件挂载时执行
  onMounted(() => {
    // 根据id获取元素
    const element = document.getElementById(id) as T
    // 如果元素存在，则将isMounted设置为true
    if (element) {
      isMounted.value = true
    }
  })
  return isMounted
}
