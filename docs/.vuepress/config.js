//npm install vue-html --save-dev
module.exports = {
    // theme: 'yubisaki',
    title: '南风知我意',
    description: '个人博客',
    head: [
        ['link', {rel: 'shortcut icon', href: `/WechatIMG1.png`}],
    ],
    plugins: [
        'flowchart'
    ],
    themeConfig: {
        lastUpdated: '更新时间',
        serviceWorker: {
            //updatePopup: true // Boolean | Object, 默认值是 undefined.
            // 如果设置为 true, 默认的文本配置将是:
            updatePopup: {
                message: "内容已更新！",
                buttonText: "Refresh"
            }
        },
        nav: [
            {text: '主页', link: '/'},
            // { text: 'Guide', link: '/guide/' },
            // {text: 'Github', link: 'https://github.com/yvanyangi'},
            // {
            //     text: 'Languages',
            //     items: [
            //         { text: 'Chinese', link: '/language/chinese' },
            //         { text: 'Japanese', link: '/language/japanese' }
            //     ]
            // }
        ],
        sidebar: [


            '/home/home',
            '/code/java-code-block',
            {
                title: 'Java基础',
                collapsable: true,
                children: [
                    '/java/java-basic'
                ]
            },
            {
                title: '分布式相关',
                collapsable: true,
                children: [
                    '/distributed/distributed-transaction'
                ]
            },
            {
                title: 'DataBase',
                collapsable: true,
                children: [
                    '/redis/redis'
                ]
            },
            // {
            //     title: 'HTML 片段',
            //     collapsable: true,
            //     children: [
            //         '/html/photo-update',
            //         '/html/get-url-params'
            //     ]
            // },
            // '/mysql/mysql'
            // ,
            // {
            //     title: '流媒体',
            //     collapsable: true,
            //     children: [
            //         '/rtmp/nginx-rtmp',
            //         '/rtmp/opencv'
            //     ]
            // },
            // {
            //     title: '地图',
            //     collapsable: true,
            //     children: [
            //         '/map/map-bubble',
            //         '/map/estimated-time'
            //     ]
            // }

        ]
    }
};
