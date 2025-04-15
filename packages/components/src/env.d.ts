declare global {
  const process: {
    env: {
      NODE_ENV: string
    }
  }

  namespace JSX {
    interface IntrinsicAttributes {
      class?: unknown
      style?: unknown
    }
  }
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
export { }