//npm install vue-html --save-dev
module.exports = {
    // theme: 'yubisaki',
    title: "YangYangYang \'s Blog",
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
            {
                title: 'Java',
                collapsable: true,
                children: [
                    '/java/java-code-block',
                    '/java/java-basic',
                    '/java/java-advanced'
                ]
            },
            {
                title: '分布式',
                collapsable: true,
                children: [
                    '/distributed/distributed-transaction'
                ]
            },
            {
                title: '数据库',
                collapsable: true,
                children: [
                    '/redis/redis'
                ]
            },
            {
                title: '版本控制',
                collapsable: true,
                children: [
                    '/version-control/git',
                    '/version-control/git-advanced'
                ]
            },
            {
                title: '服务器',
                collapsable: true,
                children: [
                    '/deploy/server-deploy'
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
