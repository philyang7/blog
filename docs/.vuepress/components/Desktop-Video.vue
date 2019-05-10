<template>
    <video controls preload="auto" :poster="poster" >
        <source :src="src">
    </video>
</template>

<script>
    export default {
        name: "Desktop-Video",
        props: ['poster', 'src'],
    }
</script>

<style scoped>
    @media screen and (max-width: 320px) {
        video {
            width: 100%;
        }
    }

    @media screen and (min-width: 321px) and (max-width: 375px) {
        video {
            width: 100%;
        }
    }

    @media screen and (min-width: 376px) and (max-width: 425px) {
        video {
            width: 100%;
        }
    }

    @media screen and (min-width: 426px) and (max-width: 768px) {
        video {
            width: 100%;
        }
    }

    @media screen and (min-width: 769px) and (max-width: 1024px) {
        video {
            width: 100%;
        }
    }

    @media screen and (min-width: 1025px) and (max-width: 1440px) {
        video {
            width: 100%;
        }
    }
    @media screen and (min-width: 1441px) and (max-width: 2560px) {
        video {
            width: 100%;
        }
    }
</style>