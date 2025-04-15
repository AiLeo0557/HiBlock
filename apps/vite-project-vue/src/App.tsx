import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <div>
        <h1>Vue 3 + TypeScript + Vite</h1>
        <p>
          <a href="https://vitejs.dev/guide/features.html" target="_blank">
            Vite Docs
          </a>
        </p>
      </div>
    );
  },
});
