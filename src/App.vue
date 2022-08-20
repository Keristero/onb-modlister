<template>
  <div id="app">
    <div class='wrap'>
      <div class='top-plane'></div>
      <div class='bottom-plane'></div>
    </div>
    <div class="container-fluid">
      <img src="@/assets/hman.png" class="hman">
      <div class="row">
        <div class="col-md-12 title">
          <h1>Higsby's Clearance Bin</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-md-10">
          <div class="available-bin">
            <ul id="main-chip">
            <draggable ghost-class="ghost" group="mods" :list="mods" @change="handleCheckout" @start="handleDragStart">
              <chip-widget v-for="(mod, idx) in mods" :key="idx"/>
            </draggable>
            </ul>
          </div>
        </div>
        <div class="col-md-2">
          <div class="shopping-cart">
            <img src="@/assets/dragon_drop.png" class="dragon-drop">
            <ul id="main-chip">
              <draggable ghost-class="ghost" group="mods" :list="checkout" @change="handleRestore" @start="handleDragStart">
                <chip-widget v-for="(mod, idx) in checkout" :key="idx"/>
              </draggable>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChipWidget from './components/ChipWidget.vue'
import draggable from 'vuedraggable'

export default {
  name: 'App',
  components: {
    ChipWidget,
    draggable
  },

  data() {
    return {
      mods: Array(50),
      checkout: [],
      sfx: {
        drop: new Audio(require('@/assets/sounds/drop.mp3')),
        pickup: new Audio(require('@/assets/sounds/pickup.mp3'))
      }
    }
  },

  methods: {
    handleCheckout(evt) {
      this.checkout.push(evt.object);
      this.sfx.drop.play();
    },

    handleRestore(evt) {
      this.mods.push(evt.object);
      this.sfx.drop.play();
    },

    handleDragStart() {
      this.sfx.pickup.play();
    }
  }
}
</script>

<style>
#app {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

.ghost {
  opacity:50%;
  filter:blur(10px) !important;
}

.shopping-cart {
  height: 100vh;
  width: 100%;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='8' stroke='%23333' stroke-width='8' stroke-dasharray='12%2c 14' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e");
  border-radius: 8px;
  overflow-y: scroll;
  scrollbar-width: none;
  padding-left:15%;
}

.available-bin {
  height: 100vh;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
}

.dragon-drop {
  width: 20%;
  padding-top: 50%;
  margin-left: 25%;
  top: 0px;
  display:inline;
  position:absolute;
  z-index: -1000;
  opacity: 100%;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color:rgba(255, 255, 255, 0.959);
  border-bottom-color:rgb(185, 185, 185);
  border-bottom-width:1px;
  border-bottom-style: solid;
  margin-bottom: 1%;
  box-shadow: 0 0 10px rgb(156, 156, 156);
}

.hman {
  position:fixed;
  bottom:0;
  left:-100px;
  transform:scaleX(-1) translateY(400px);
  z-index: 1000;
}

.slidein {
  -webkit-animation-name: slidein; 
  animation-name: slidein;
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
}

@keyframes slidein {
    0%  {-webkit-transform: translateX(-100px);} 
    100% {-webkit-transform: translateX(0px);}  
}

@-webkit-keyframes slidein { 
    0%  {-webkit-transform: translateX(-100px);} 
    100% {-webkit-transform: translateX(0px);} 
} 
</style>
