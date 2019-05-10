<template>
        <div id="comments"></div>
</template>

<script>
    import Gitalk from 'gitalk'

    export default {
        name: "Gitalk-Comment",
        props: ['tags'],
        data() {
            return {
                myGitalk: new Gitalk({
                    clientID: '9b600a5cc026d65c9bb2',
                    clientSecret: '6978d7f1f640b38b7e52fb0df795878fa3c1fc85',
                    repo: 'Viking1726.github.io',
                    owner: 'Viking1726',
                    admin: ['Viking1726'],
                    id: window.location.hash,      // Ensure uniqueness and length less than 50
                    distractionFreeMode: false,  // Facebook-like distraction free mode
                    language: 'zh-CN',
                    labels:[this.tags]
                })
            }
        },
        mounted() {
            // this.myGitalk.render("comments");

            const gitalk = new Gitalk({
                clientID: '9b600a5cc026d65c9bb2',
                clientSecret: '6978d7f1f640b38b7e52fb0df795878fa3c1fc85',
                repo: 'Viking1726.github.io',
                owner: 'Viking1726',
                admin: ['Viking1726'],
                id: window.location.hash,      // Ensure uniqueness and length less than 50
                distractionFreeMode: false,  // Facebook-like distraction free mode
                language: 'zh-CN',
                labels:[this.tags]
            })

            gitalk.render("comments");
        }
    }
</script>

<style scoped>

</style>