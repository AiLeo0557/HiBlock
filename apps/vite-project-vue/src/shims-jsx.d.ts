import { JSX } from 'vue/jsx'

declare module 'vue' {
  interface HTMLAttributes extends JSX.HTMLAttributes { }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}