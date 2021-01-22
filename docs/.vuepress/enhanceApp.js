/**
 * 扩展 VuePress 应用
 */
import VueHighlightJS from 'vue-highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueECharts from 'vue-echarts' //注册图表
import '../.vuepress/public/css/index.css'
// import 'gitalk/dist/gitalk.css'
// import 'gitment/style/default.css'

// export default ({
//   Vue, // VuePress 正在使用的 Vue 构造函数
//   options, // 附加到根实例的一些选项
//   router, // 当前应用的路由实例
//   siteData // 站点元数据
// }) => {
//   // ...做一些其他的应用级别的优化
//   Vue.use(VueHighlightJS);
//   Vue.use(Element);
//   Vue.component('chart', VueECharts)
// }


function integrateGitalk(to) {
    const linkGitalk = document.createElement('link');
    linkGitalk.href = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css';
    linkGitalk.rel = 'stylesheet';
    document.body.appendChild(linkGitalk);
    const scriptGitalk = document.createElement('script');
    scriptGitalk.src = 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js';
    document.body.appendChild(scriptGitalk);

    if (scriptGitalk.onload) {
        loadGitalk(to);
    } else {
        scriptGitalk.onload = () => {
            loadGitalk(to);
        }
    }

    function loadGitalk(to) {
        let commentsContainer = document.getElementById('gitalk-container');
        if (!commentsContainer) {
            commentsContainer = document.createElement('div');
            commentsContainer.id = 'gitalk-container';
            commentsContainer.classList.add('content');
        }
        const $page = document.querySelector('.page');
        if ($page) {
            $page.appendChild(commentsContainer);
            if (typeof Gitalk !== 'undefined' && Gitalk instanceof Function) {
                renderGitalk(to.fullPath);
            }
        }
    }

    function renderGitalk(fullPath) {
        var path = fullPath.split(".")[0]
        var labels = path.split("/")[2]
        const gitalk = new Gitalk({
            clientID: '96157176c0cb62fd0ffe',
            clientSecret: '5d304b6b5acb5e56dcb8436e4ba1f7155ddfc429',
            repo: 'YvanYangi.github.io',
            owner: 'YvanYangi',
            admin: ['YvanYangi'],
            // id: window.location.hash,      // Ensure uniqueness and length less than 50
            id: "",      // Ensure uniqueness and length less than 50
            distractionFreeMode: false,  // Facebook-like distraction free mode
            language: 'zh-CN',
            labels: [labels]
        });
        gitalk.render('gitalk-container');
    }
}

function initClick() {
    var emoji = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😚', '😙', '😗',
        '😘', '😍', '😌', '😉', '🙃', '🙂', '😇', '😋', '😜', '😝', '😛', '🤑', '🤗', '🤓',
        '😎', '🤡', '🤠', '😖', '😣', '🙁', '😕', '😟', '😔', '😞', '😒', '😏', '😫', '😩',
        '😤', '😠', '😡', '😶', '😐', '😑', '😯', '😦', '😥', '😢', '😨', '😱', '😳', '😵',
        '😲', '😮', '😧', '🤤', '😭', '😪', '😴', '🙄', '🤔', '😬', '🤥', '🤐', '🤕', '🤒',
        '😷', '🤧']
    var $html = document.getElementsByTagName("html")[0];
    var $body = document.getElementsByTagName("body")[0];
    $html.onclick = function (e) {
        var $elem = document.createElement("b");
        $elem.style.color = "#E94F06";
        $elem.style.zIndex = 9999;
        $elem.style.position = "absolute";
        $elem.style.select = "none";
        var x = e.pageX;
        var y = e.pageY;
        $elem.style.left = (x - 10) + "px";
        $elem.style.top = (y - 20) + "px";
        clearInterval(anim);
        var index = Math.floor(Math.random() * emoji.length);
        $elem.innerText = emoji[index];
        $elem.style.fontSize = Math.random() * 10 + 10 + "px";
        var increase = 0;
        var anim;
        setTimeout(function () {
            anim = setInterval(function () {
                if (++increase == 150) {
                    clearInterval(anim);
                    $body.removeChild($elem);
                }
                $elem.style.top = y - 20 - increase + "px";
                $elem.style.opacity = (150 - increase) / 120;
            }, 8);
        }, 70);
        $body.appendChild($elem);
    };
};


export default ({Vue, options, router}) => {
    try {
        // initClick()
        document && router.afterEach((to) => {
            integrateGitalk(to)
        })
    } catch (e) {
        console.error(e.message)
    }
}
