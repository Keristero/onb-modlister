<template>
    <li class="">
        <div class="chip-box">
            <div class="ct-curve"></div>
            <div class="game-pic">
                <div class="black-circle"></div>
                <p class="name">DRKACRIS</p>
                <img src="https://metaperficient.com/mods.battlenetwork.io/game1.jpg">
                <p class="damage" style="color: rgb(255, 255, 125);">200</p>
            </div>
            <div class="chip-inner">
                <p class="chip_codes">
                    <img class="chip_icon" src="http://mods.battlenetwork.io/images/com_DJ_card_DarkLegnofAcrius_icon.png"> C
                </p>
            </div>
            <p class="description">CABAL MADE EXOTIC SHOTGUN TAINTED WITH DARKNESS</p>
            <div class="chip-teeth">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="detail_view" style="display: none;">
                <p>ID: com.DJ.card.DarkLegnofAcrius</p>
                <p>Uploader: Cyanman EXE</p>
                <p>
                    Thread: <a href="discord://discord.com/channels/455429604455219211/1006720904895664158/1006720908473421946" target="_blank">Discord</a>
                    <a href="https://discord.com/channels/455429604455219211/1006720904895664158/1006720908473421946" target="_blank">Web</a>
                </p>
                <p>Date: 8/10/2022</p>
                <p>Hash: 8048cd2dec104fdc5759723e03a1faad</p>
                <p>Tags: [CUS] [CHIP] </p>
            </div>
        </div>
    </li>
</template>

<script>
import '@/assets/css/main.css'
export default {
  name: 'ChipWidget',
  components: {
  },

  data() {
    return {
    }
  }
}
</script>

<style scoped>
@keyframes bounce {
    0%  {-webkit-transform: translateX(-100px);} 
    100% {-webkit-transform: translateX(0px);}  
}

@-webkit-keyframes bounce { 
    0%  {-webkit-transform: translateX(-100px);} 
    100% {-webkit-transform: translateX(0px);} 
} 

.bounce_fx {
    -webkit-animation-name: bounce; 
    animation-name: bounce;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
}
</style>
