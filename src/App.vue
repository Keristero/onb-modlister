<template>
  <div id="app">
    <ul id="main-chip">
      <chip-widget v-for="(mod, idx) in mods" :key="idx">
      </chip-widget>
    </ul>
  </div>
</template>

<script>
import ChipWidget from './components/ChipWidget.vue'
export default {
  name: 'App',
  components: {
    ChipWidget,
  },

  data() {
    return {
      mods: [0,1,2,3,4,5],
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
