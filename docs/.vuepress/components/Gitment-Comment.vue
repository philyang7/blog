<template>
    <div id="comments"></div>
</template>

<script>
    import Gitment from 'gitment'

    export default {
        name: "Gitment-Comment",
        props: ['tags'],
        data() {
            return {
                myGitment: new Gitment({
                    owner: 'Viking1726',
                    repo: 'Viking1726.github.io',
                    oauth: {
                        client_id: '9b600a5cc026d65c9bb2',
                        client_secret: '6978d7f1f640b38b7e52fb0df795878fa3c1fc85',
                    },
                    id: this.tags, // optional
                    // ...
                    // For more available options, check out the documentation below
                })
            }
        },
        mounted() {
            this.myGitment.render("comments");
        }
    }
</script>

<style scoped>

</style>