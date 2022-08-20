<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              <div id="filters">
              </div>
          </div>
      </div>
      <div class="row">
        <ul id="main-chip">
        <chip-widget v-for="(mod, idx) in mods" :key="idx"/>
        </ul>
      </div>
    </div>
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
/* unused */
/* #app {

}
*/
</style>
