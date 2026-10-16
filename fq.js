getHost = (a, b, c, d) => [
    ["https://"][0],
    [
        "reading",
        "api",
        "api3",
        "api5",
        "novel",
        "",
    ][(a == 4 ? 5 : b) || 0],
    [
        "",
        "-normal",
    ][c || 0],
    [
        "",
        "-hl",
        "-lf",
        "-lq",
        "-sinfonlinea",
        "-sinfonlineb",
        "-sinfonlinec",
    ][d || 0],
    [".", ""][a == 4 ? 1 : 0],
    [
        "snssdk",
        "fqnovel",
        "fanqiesdk",
        "toutiaoapi",
        "fanqienovel",
    ][a || 0],
    [".com"][0],
].join("");
javaImport = new JavaImporter()
javaImport.importPackage(
    Packages.okhttp3,
    Packages.cn.hutool.core.util,
    Packages.cn.hutool.core.codec,
    Packages.cn.hutool.crypto.digest
)
with(javaImport) {
    //POST请求
    function post(url, body, map) {
        let json = MediaType.parse("application/json");
        let request = new Request.Builder()
            .url(url)
            .post(RequestBody.create(body, json));
        if (map) {
            request.addHeader("Content-Encoding", "gzip");
            for (let n in map) {
                request.addHeader(n, map[n]);
            }
        }
        let client = new OkHttpClient();
        let response = client.newCall(request.build()).execute();
        return JSON.parse(response.body().string());
    }

    function okhttpGet(url, map) {
        const {
            java
        } = this
        let request = new Request.Builder()
            .url(url)
            .get();
        if (map) {
            request.addHeader("Content-Encoding", "gzip");
            for (let n in map) {
                request.addHeader(n, map[n]);
            }
        }
        //java.log("okhttp: " + url + ", headers=" + JSON.stringify(map))
        let client = new OkHttpClient();
        let response = client.newCall(request.build()).execute();
        return JSON.parse(response.body().string());
    }

    function okhttpWithHeaders(url, map) {
        const {
            java
        } = this
        let request = new Request.Builder()
            .url(url)
            .get();
        if (map) {
            request.addHeader("Content-Encoding", "gzip");
            for (let n in map) {
                request.addHeader(n, map[n]);
            }
        }
        //java.log("okhttp: " + url + ", headers=" + JSON.stringify(map))
        let client = new OkHttpClient();
        let response = client.newCall(request.build()).execute();
        let headers = {}
        let names = response.headers().names()
        names.forEach((k) => {
            headers[k] = response.headers().get(k)
        })
        return {
            body: JSON.parse(response.body().string()),
            headers: headers
        }
    }

    //Base64编码
    let b64En = (b64) => Base64.encode(b64);

    //Base64解码
    let b64De = (b64) => Base64.decode(b64);

    function gzip(data) {
        ZipUtil.gzip(data, "")
    }

    //X-Gorgon参数
    function xGorgon(path, params, data, ck) {
        const {
            java,
            source
        } = this;
        params = [
            params,
            "aid=1967",
            "channel=0",
            "os_version=0",
            "app_name=novelapp",
            "version_code=69132",
            "device_platform=android",
            "device_type=unknown",
        ].join("&").split("&").sort().join("&").replace(/^&+/, "");
        if (!data) {
            path = "/reading/bookapi/" + path + "/v/?";
        }
        let url = getHost() + path + params;
        let devtype
        for (let i of (source.getLoginHeader() || '').split('&')) {
            // java.log(i)
            if (i.startsWith('device_type')) {
                // java.log(i)
                devtype = i.split('=')[1]
            }
        }


        //md5加密
        let md5 = (str) => DigestUtil.md5Hex(str);

        //反转字符串
        let rStr = (str) => StrUtil.reverse(str);

        //10转16进制
        let Hex = (num) => num.toString(16).padStart(2, "0");

        //反转16进制
        let rHex = (num) => parseInt(rStr(Hex(num)), 16);

        //反转2进制
        function rBin(num) {
            let bin = num.toString(2).padStart(8, "0");
            return parseInt(rStr(bin), 2);
        }

        //运算
        function getHex(ck) {
            let hex = md5(params)
            hex += data ? md5(data) : "0".repeat(8)
            hex += ck ? md5(ck) : "0".repeat(8)
            return hex
        }

        function calculate(hex, ck) {
            let len = 0x14;
            let key = [0xDF, 0x77, 0xB9, 0x40, 0xB9, 0x9B, 0x84, 0x83, 0xD1, 0xB9, 0xCB, 0xD1, 0xF7, 0xC2, 0xB9, 0x85, 0xC3, 0xD0, 0xFB, 0xC3];
            let paramList = [];
            for (let i = 0; i < 9; i += 4) {
                let temp = hex.substring(8 * i, 8 * (i + 1));
                for (let j = 0; j < 4; j++) {
                    let h = parseInt(temp.substring(j * 2, (j + 1) * 2), 16);
                    paramList.push(h);
                }
            }
            paramList.push(0x0, 0x6, 0xB, 0x1C);
            let T = Math.floor(Date.now() / 1000);
            paramList.push((T >> 24) & 0xFF, (T >> 16) & 0xFF, (T >> 8) & 0xFF, T & 0xFF);
            //异或
            let eorResultList = []
            for (let i = 0; i < paramList.length; i++) {
                eorResultList.push(paramList[i] ^ key[i % len]);
            }
            for (let A, B, C, D, i = 0; i < len; i++) {
                A = rHex(eorResultList[i]);
                B = eorResultList[(i + 1) % len];
                C = rBin(A ^ B);
                D = ((C ^ 0xFFFFFFFF) ^ len) & 0xFF;
                eorResultList[i] = D;
            }
            let result = ""
            for (let param of eorResultList) {
                result += Hex(param);
            }
            let option = {
                "headers": {
                    "X-Khronos": String(T),
                    "X-Gorgon": "0404b0d30000" + result,
                    "User-Agent": 'com.dragon.read',
                    "Cookie": ck ? ck : ""
                }
            }
            let b_ = option
            b_["body"] = String(data ? data : "")
            //java.log(url + "," + JSON.stringify(b_))
            if (data) {
                return post(url, data, option.headers).data;
            } else {
                return url + "," + JSON.stringify(option);
            }
        }
        return calculate(getHex(ck), ck);
    }
}

function getBookId(url) {
    const {
        java
    } = this
    let $ = JSON.parse(url).data
    let arr, list
    if ($.book_shelf_info != 0 && $.book_shelf_info != undefined) {
        arr = $.book_shelf_info.map($ => $.book_id)
    } else if (list = $.data_list != 0 && $.data_list != undefined) {
        arr = $.data_list.map($ => $.book_id_str)
    } else {
        java.toast("获取 book_id 失败，你可能需要登录！")
    }
    return arr.slice(0, 100)
}

function getBookIdFull(url) {
    const {
        java
    } = this
    let $ = JSON.parse(url).data
    let arr, list
    if ($.book_shelf_info != 0 && $.book_shelf_info != undefined) {
        arr = $.book_shelf_info.map($ => $.book_id)
    } else if (list = $.data_list != 0 && $.data_list != undefined) {
        arr = $.data_list.map($ => $.book_id_str)
    } else {
        java.toast("获取 book_id 失败，你可能需要登录！")
    }
    return arr
}

function splitArray(input, size) {
    const output = []
    for (let i = 0; i < input.length; i += size) {
        output.push(input.slice(i, i + size))
    }
    return output
}

let replaceCover = (u) => {
    // 新增判断：若链接以指定前缀开头，直接返回原链接
    if (u.startsWith("https://p3-reading-sign.fqnovelpic.com/novel-pic-r/")) {
        return u;
    } else if (u.startsWith("https://")) {
        u = u.substring(8);
    } else if (u.startsWith("http://")) {
        u = u.substring(7);
    } else {
        u = "fq/" + u;
    }

    let uArr = u.split("/");
    uArr[0] = "https://p6-novel.byteimg.com/origin";
    let uArr2 = [];

    uArr.forEach((x) => {
        if (!x.includes("?") && !x.includes("~")) {
            uArr2.push(x);
        } else {
            uArr2.push(x.split("~")[0]);
        }
    });

    u = uArr2.join("/");
    return u;
};

function v(n) {
    // 从上下文获取java cache source变量
    const {
        java,
        source,
        cookie
    } = this;
    try {
        JSON.parse(source.getVariable());
    } catch (err) {
        source.setVariable('{}');
        JSON.parse(source.getVariable());
    }
    return JSON.parse(source.getVariable())[n];

}

function sv(n, v) {
    const {
        java,
        source
    } = this;
    let variable = source.getVariable();

    let data;
    try {
        data = JSON.parse(variable);
    } catch (err) {
        //java.log('Failed to parse variable:');
        data = {};
    }

    data[n] = v;
    const newVariable = JSON.stringify(data, null, '\t');
    source.setVariable(newVariable);
}

function rep(reps) {
    const {
        java,
        book
    } = this;
    let a = String(reps).replace(/<\!DOCTYPE html PUBLIC "-\/\/W3C\/\/DTD XHTML 1\.1\/\/EN" "http:\/\/www.w3.org\/TR\/xhtml11\/DTD\/xhtml11.dtd">|<\?xml .*"no"\?>|\{\!-- PGC_VOICE:.*\} --}/g, "").replace(/(\s*尊敬的用户你好，最近发现有人贩卖本书源|推广\(为了维持服务器长期运营\)：|全局公告：最近发现有人冒充我|本书源属于免费公益书源|声明：本书源为免费书源|妍希提醒您：|本书源属于大灰狼|独有公益书源|聚合书源交流群:792796396!接收更多通知|禁止传播直链或者书源文件以及下载小说|最近交流地址:https:\/\/t\.me\/phpqidian|书源公告:)(.|\n)*|您访问过快，请稍后再试.*|当前章节不可查看，.*|undefined|\n\n———— 网站公告(.|\n)+|\s+妍󠇕希󠆖󠅽󠇕󠆨󠅼󠄡󠄩󠄠󠄩󠄣󠄣󠄢󠄨󠄨󠄩\s+/g, "")
    if (book.type != 64 && book.type != 1088) {
        a = a.replace(/<header>.*<\/header>/g, "").replace(/<div/g, "<p").replace(/^/g, "<p>").replace(/$/g, "</p>").replace(/\n+/g, "</p><p>")
    }
    return a
}

function bookid() {
    const {
        java,
        book
    } = this;
    return book.bookUrl.match(/(book_id|query)=(\d+)/)[2]
}

function formatArray(arr) {
    const {
        java,
        source,
        book
    } = this;
    return arr.map(item => {
        let u = String(book.bookUrl).replace(/&.*/g, "");
        // 基础 a 标签模板（不含特殊名称）
        const baseLink = `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">音频</a>`;

        if (item === 1) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">甜美少女</a>`;
        } else if (item === 2) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">清亮青叔</a>`;
        } else if (item === 4) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">成熟大叔</a>`;
        } else if (item === 5) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">开朗青年</a>`;
        } else if (item === 6) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">温柔淑女</a>`;
        } else if (item === 8) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">风雅青叔</a>`;
        } else if (item === 12) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">青纯少女</a>`;
        } else if (item === 17) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">磁性青叔</a>`;
        } else if (item === 27) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">推文女声</a>`;
        } else if (item === 28) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">亲切姐姐</a>`;
        } else if (item === 29) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">儒雅大叔</a>`;
        } else if (item === 30) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">优雅御姐</a>`;
        } else if (item === 31) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">斯文青叔</a>`;
        } else if (item === 32) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">知性主播</a>`;
        } else if (item === 51) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人发音</a>`;
        } else if (item === 74) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">大叔升级</a>`;
        } else if (item === 80) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人升级80</a>`;
        } else if (item === 82) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人升级82</a>`;
        } else if (item === 91) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人升级91</a>`;
        } else if (item === 97) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人升级97</a>`;
        } else if (item === 100) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">俏皮御姐</a>`;
        } else if (item === 103) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">双音灵动</a>`;
        } else if (item === 105) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">王明军音</a>`;
        } else if (item === 114) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">多人升级114</a>`;
        } else if (item === 115) {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">从容淑女</a>`;
        } else if (item > 10000) {
            return `<a href="legado://import/addToBookshelf?src=https://reading.snssdk.com/reading/bookapi/detail/v/?book_id=${item}">真人朗读</a>`;
        } else {
            return `<a href="legado://import/addToBookshelf?src=${u}%26tone_id=${item}">音频${item}</a>`;
        }
    });
}


function createLegadoBookLinks(idString, customText) {
    // 1. 处理ID：分割字符串、去除空格、过滤空值（避免多余逗号导致错误）
    const bookIds = idString.split(',').map(id => id.trim()).filter(id => id.length > 0);
    // 2. 校验输入有效性
    if (bookIds.length === 0) return '错误：请输入有效的book_id（逗号分隔）';
    if (!customText || customText.trim() === '') return '错误：请输入自定义文本（如"短剧"）';

    // 3. 生成每个<a>标签：仅多个项时添加序号，单个项不加序号
    const linkList = bookIds.map((bookId, index) => {
        const srcUrl = `https://reading.snssdk.com/reading/bookapi/detail/v/?book_id=${bookId}`;
        const legadoHref = `legado://import/addToBookshelf?src=${srcUrl}`;
        // 判断：若只有1个项则直接用自定义文本，多个项则添加序号
        const linkText = bookIds.length === 1 ? customText : `${customText}${index + 1}`;
        return `<a href="${legadoHref}">${linkText}</a>`;
    });

    // 4. 每个标签单独换行，方便复制粘贴
    return linkList.join('\n');
}

function addToBookshelf() {
    const {
        java,
        book
    } = this;
    try {
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>相关资源查询</title>
    <style>
        /* 全局重置与基础样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Microsoft YaHei", Arial, sans-serif;
        }
        body {
            background-color: #f8f9fa;
            min-height: 100vh;
            padding: 20px;
        }
        /* 标题样式 */
        .page-title {
            text-align: center;
            color: #333;
            font-size: 22px;
            margin-bottom: 25px;
            font-weight: 600;
        }
        /* 内容分类容器（通用） */
        .content-group {
            max-width: 600px;
            margin: 0 auto;
            margin-bottom: 20px;
        }
        .content-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
        }
        /* 分类标题样式 */
        .group-title {
            font-size: 16px;
            color: #555;
            margin-bottom: 10px;
            font-weight: 500;
        }
        /* 1. 小说分类链接：青色 */
        .novel-group .content-list a {
            background-color: #00bcd4;
        }
        .novel-group .content-list a:hover {
            background-color: #0097a7;
        }
        /* 2. 漫画分类链接：紫色 */
        .comic-group .content-list a {
            background-color: #9c27b0;
        }
        .comic-group .content-list a:hover {
            background-color: #7b1fa2;
        }
        /* 3. 短剧分类链接：橙色 */
        .drama-group .content-list a {
            background-color: #ff9800;
        }
        .drama-group .content-list a:hover {
            background-color: #f57c00;
        }
        /* 4. 漫剧分类链接：绿色 */
        .comic-drama-group .content-list a {
            background-color: #4caf50;
        }
        .comic-drama-group .content-list a:hover {
            background-color: #388e3c;
        }
        /* 5. 真人朗读链接：蓝色（保留原色） */
        .zrld-group .content-list a {
            background-color: #4285f4;
        }
        .zrld-group .content-list a:hover {
            background-color: #3367d6;
        }
        /* 6. 智能朗读链接：红色（保留原色） */
        .znld-group .content-list a {
            background-color: #ea4335;
        }
        .znld-group .content-list a:hover {
            background-color: #c83123;
        }
        /* 通用链接按钮样式 */
        .content-list a {
            display: inline-block;
            text-align: center;
            padding: 11px 12px;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 500;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.25s ease;
        }
    </style>
</head>
<body>
    <h1 class="page-title">相关资源查询</h1>

    <!-- 小说分类：添加专属类novel-group -->
    <div class="content-group novel-group">
        <p class="group-title">小说分类：</p>
        <div class="content-list" id="novelList">
            ${book.getVariable('xsid')}
        </div>
    </div>

    <!-- 漫画分类：添加专属类comic-group -->
    <div class="content-group comic-group">
        <p class="group-title">漫画分类：</p>
        <div class="content-list" id="comicList">
            ${book.getVariable('mhid')}
        </div>
    </div>

    <!-- 短剧分类：添加专属类drama-group -->
    <div class="content-group drama-group">
        <p class="group-title">短剧分类：</p>
        <div class="content-list" id="shortDramaList">
            ${book.getVariable('djid')}
        </div>
    </div>

    <!-- 漫剧分类：添加专属类comic-drama-group -->
    <div class="content-group comic-drama-group">
        <p class="group-title">漫剧分类：</p>
        <div class="content-list" id="comicDramaList">
            ${book.getVariable('dmid')}
        </div>
    </div>

    <!-- 真人朗读分组（保留原类） -->
    <div class="content-group zrld-group">
        <p class="group-title">真人朗读 音色：</p>
        <div class="content-list" id="zrldList">
            ${book.getVariable('zrld')}
        </div>
    </div>

    <!-- 智能朗读分组（保留原类） -->
    <div class="content-group znld-group">
        <p class="group-title">智能朗读 音色：</p>
        <div class="content-list" id="znldList">
            ${book.getVariable('znld')}
        </div>
    </div>

    <script>
        // 检查小说分类（空内容时隐藏）
        const novelList = document.getElementById('novelList');
        const novelGroup = novelList.parentElement;
        if (novelList.innerHTML.trim() === '') {
            novelGroup.style.display = 'none';
        }

        // 检查漫画分类（空内容时隐藏）
        const comicList = document.getElementById('comicList');
        const comicGroup = comicList.parentElement;
        if (comicList.innerHTML.trim() === '') {
            comicGroup.style.display = 'none';
        }

        // 检查短剧分类（空内容时隐藏）
        const shortDramaList = document.getElementById('shortDramaList');
        const shortDramaGroup = shortDramaList.parentElement;
        if (shortDramaList.innerHTML.trim() === '') {
            shortDramaGroup.style.display = 'none';
        }

        // 检查漫剧分类（空内容时隐藏）
        const comicDramaList = document.getElementById('comicDramaList');
        const comicDramaGroup = comicDramaList.parentElement;
        if (comicDramaList.innerHTML.trim() === '') {
            comicDramaGroup.style.display = 'none';
        }

        // 检查真人朗读分组
        const zrldList = document.getElementById('zrldList');
        const zrldGroup = zrldList.parentElement;
        if (zrldList.innerHTML.trim() === '') {
            zrldGroup.style.display = 'none';
        }

        // 检查智能朗读分组
        const znldList = document.getElementById('znldList');
        const znldGroup = znldList.parentElement;
        if (znldList.innerHTML.trim() === '') {
            znldGroup.style.display = 'none';
        }
    </script>
</body>
</html>
`

        let response = java.startBrowser("", "添加书架", html)
    } catch (err) {
        java.toast("请添加书架后书籍页面点击")
    }
}
var FQ_H=String.fromCharCode(35,35);var FQ_SH=String.fromCharCode(35);var FQ_SL=String.fromCharCode(47);var FQ_Q=String.fromCharCode(39);var FQ_DQ=String.fromCharCode(34);var FQ_SP=String.fromCharCode(32);var FQ_MUA='Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36';var FQ_FUA='com.ss.android.article.news/13400 (Linux; U; Android 10; zh_CN; tb8788p1_64_bsp; Build/QQ3A.200805.001)';var FQ_FIXED='TdTC5rgxYgkOUrPHpnM7pByyRiuCmrWKGWs521cXdST0m69/COjWjSanLjfBqVovHwWlGJKu8pSXMrYqOKrdWA==';var FQ_HOST='https://api5-normal-sinfonlineb.fqnovel.com';var FQ_WEB='https://fanqienovel.com';var FQ_MSG_DETAIL=String.fromCharCode(35814,24773,33719,21462,22833,36133,65292,35831,37325,35797);var FQ_MSG_TOC=String.fromCharCode(30446,24405,33719,21462,22833,36133,65292,35831,37325,35797);var FQ_MSG_CT=String.fromCharCode(27491,25991,33719,21462,22833,36133,65292,35831,37325,35797);var FQ_MSG_LOCK=String.fromCharCode(128274);var FQ_MSG_EMPTY=String.fromCharCode(26412,31456,26242,26080,20869,23481,65292,35831,25442,28304);var FQ_IMG=String.fromCharCode(123,123,105,109,97,103,101,95,100,111,109,97,105,110,125,125);var FQ_MSG_PAY=String.fromCharCode(26412,31456,20026,20184,36153,31456,33410,65292,32593,39029,29256,26080,27861,20813,36153,38405,35835);function FQ_j2s(b){try{return String(new Packages.java.lang.String(b,Packages.java.nio.charset.Charset.forName('ISO-8859-1')));}catch(e){var s='';for(var i=0;i<b.length;i++){var v=b[i];if(v<0)v+=256;s+=String.fromCharCode(v);}return s;}}function FQ_s2j(s){return new Packages.java.lang.String(s).getBytes(Packages.java.nio.charset.Charset.forName('ISO-8859-1'));}function FQ_hex(b){var str=FQ_j2s(b);var s='';for(var i=0;i<str.length;i++){var v=str.charCodeAt(i)&255;s+=(v<16?'0':'')+v.toString(16);}return s;}function FQ_unhex(h){var r='';for(var i=0;i<h.length;i+=2)r+=String.fromCharCode(parseInt(h.substr(i,2),16));return r;}function FQ_sm3(s){var rotl=function(x,n){n=n&31;return ((x<<n)|(x>>>(32-n)))>>>0;};var len=s.length,bitLen=len*8,arr=[];for(var i=0;i<len;i++)arr.push(s.charCodeAt(i)&255);arr.push(0x80);while(arr.length%64!==56)arr.push(0);var hi=Math.floor(bitLen/4294967296),lo=bitLen>>>0;arr.push((hi>>>24)&255,(hi>>>16)&255,(hi>>>8)&255,hi&255);arr.push((lo>>>24)&255,(lo>>>16)&255,(lo>>>8)&255,lo&255);var V=[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];for(var b=0;b<arr.length;b+=64){var W=[];for(var i=0;i<16;i++)W.push(((arr[b+i*4]<<24)|(arr[b+i*4+1]<<16)|(arr[b+i*4+2]<<8)|arr[b+i*4+3])>>>0);for(var j=16;j<68;j++){var x=(W[j-16]^W[j-9]^rotl(W[j-3],15))>>>0;x=(x^rotl(x,15)^rotl(x,23))>>>0;W.push((x^rotl(W[j-13],7)^W[j-6])>>>0);}var W1=[];for(var j=0;j<64;j++)W1.push((W[j]^W[j+4])>>>0);var A=V[0],B=V[1],C=V[2],D=V[3],E=V[4],F=V[5],G=V[6],H=V[7];for(var j=0;j<64;j++){var Tj=(j<16)?0x79cc4519:0x7a879d8a;var SS1=rotl((rotl(A,12)+E+rotl(Tj,j&31))>>>0,7);var SS2=(SS1^rotl(A,12))>>>0;var FFj=(j<16)?((A^B^C)>>>0):(((A&B)|(A&C)|(B&C))>>>0);var GGj=(j<16)?((E^F^G)>>>0):(((E&F)|((~E)&G))>>>0);var TT1=(FFj+D+SS2+W1[j])>>>0;var TT2=(GGj+H+SS1+W[j])>>>0;D=C;C=rotl(B,9);B=A;A=TT1;H=G;G=rotl(F,19);F=E;E=(TT2^rotl(TT2,9)^rotl(TT2,17))>>>0;}V[0]=(V[0]^A)>>>0;V[1]=(V[1]^B)>>>0;V[2]=(V[2]^C)>>>0;V[3]=(V[3]^D)>>>0;V[4]=(V[4]^E)>>>0;V[5]=(V[5]^F)>>>0;V[6]=(V[6]^G)>>>0;V[7]=(V[7]^H)>>>0;}var out='';for(var i=0;i<8;i++)out+=('0000000'+V[i].toString(16)).slice(-8);return out;}function FQ_md5(s){var d=Packages.java.security.MessageDigest.getInstance('MD5');var b=FQ_s2j(s);d.update(b);return FQ_hex(d.digest());}function FQ_b64(s){return String(Packages.java.util.Base64.getEncoder().encodeToString(FQ_s2j(s)));}function FQ_b64d(s){return FQ_j2s(Packages.java.util.Base64.getDecoder().decode(String(s)));}function FQ_aesCbc(data,key,iv){var C=Packages.javax.crypto.Cipher;var c=C.getInstance('AES/CBC/NoPadding');c.init(C.ENCRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(FQ_s2j(key),'AES'),new Packages.javax.crypto.spec.IvParameterSpec(FQ_s2j(iv)));return FQ_j2s(c.doFinal(FQ_s2j(data)));}function FQ_pad(s){var p=16-(s.length%16);if(p===0)p=16;var o=s;for(var i=0;i<p;i++)o+=String.fromCharCode(p);return o;}function FQ_w(lo,hi){return {lo:lo>>>0,hi:hi>>>0};}function FQ_xor(){var lo=0,hi=0;for(var i=0;i<arguments.length;i++){lo^=arguments[i].lo;hi^=arguments[i].hi;}return FQ_w(lo,hi);}function FQ_n64(v){return FQ_w(~v.lo,~v.hi);}function FQ_add(a,b){var lo=(a.lo+b.lo)>>>0;return FQ_w(lo,(a.hi+b.hi+(lo<a.lo?1:0))>>>0);}function FQ_rol(v,c){var s=((c%64)+64)%64;if(s===0)return FQ_w(v.lo,v.hi);if(s<32)return FQ_w((v.lo<<s)|(v.hi>>>(32-s)),(v.hi<<s)|(v.lo>>>(32-s)));if(s===32)return FQ_w(v.hi,v.lo);var r=s-32;return FQ_w((v.hi<<r)|(v.lo>>>(32-r)),(v.lo<<r)|(v.hi>>>(32-r)));}function FQ_ror(v,c){return FQ_rol(v,64-(c%64));}function FQ_r64(s,o){o=o||0;return FQ_w((s.charCodeAt(o)|(s.charCodeAt(o+1)<<8)|(s.charCodeAt(o+2)<<16)|(s.charCodeAt(o+3)<<24))>>>0,(s.charCodeAt(o+4)|(s.charCodeAt(o+5)<<8)|(s.charCodeAt(o+6)<<16)|(s.charCodeAt(o+7)<<24))>>>0);}function FQ_w64le2(l,r){var o='';for(var i=0;i<4;i++)o+=String.fromCharCode((l.lo>>>(i*8))&255);for(var i2=0;i2<4;i2++)o+=String.fromCharCode((l.hi>>>(i2*8))&255);for(var i3=0;i3<4;i3++)o+=String.fromCharCode((r.lo>>>(i3*8))&255);for(var i4=0;i4<4;i4++)o+=String.fromCharCode((r.hi>>>(i4*8))&255);return o;}var FQ_SZ=FQ_w(0x046d678b,0x3dc94c3a);function FQ_zbit(i){return FQ_w(i<32?((FQ_SZ.lo>>>i)&1):((FQ_SZ.hi>>>(i-32))&1),0);}var FQ_SK='fc78e0a9657a0c748ce51559903ccf03510e51d3cff232d71343e88a321c5304';var FQ_AK='d31e3718288a1027baab59f146a09a9c';var FQ_AIV='ea180a0336ed352fcd24e4d50018ae54';function FQ_srk(key){var w=[];for(var i=0;i<4;i++)w.push(FQ_r64(key,i*8));for(var x=4;x<72;x++){var m=FQ_xor(FQ_ror(w[x-1],3),w[x-3]);m=FQ_xor(m,FQ_ror(m,1));w.push(FQ_xor(FQ_n64(w[x-4]),m,FQ_zbit((x-4)%62),FQ_w(3,0)));}return w;}function FQ_sEnc(blk,keys){var l=FQ_r64(blk,0),r=FQ_r64(blk,8);for(var i=0;i<keys.length;i++){var o=r;var nl=FQ_w(FQ_rol(r,1).lo&FQ_rol(r,8).lo,FQ_rol(r,1).hi&FQ_rol(r,8).hi);r=FQ_xor(l,nl,FQ_rol(r,2),keys[i]);l=o;}return FQ_w64le2(l,r);}function FQ_ev(v){var o='';while(v>=0x80){o+=String.fromCharCode((v%0x80)|0x80);v=Math.floor(v/0x80);}o+=String.fromCharCode(v);return o;}function FQ_pbv(f,v){return FQ_ev(f*8)+FQ_ev(v);}function FQ_pbb(f,v){var e=(typeof v==='number')?String.fromCharCode(v):String(v);return FQ_ev(f*8+2)+FQ_ev(e.length)+e;}function FQ_argusBean(q,stub,ts,dev,iid,aid,rv){var bi=(/^[0-9a-f]{32}$/i.test(stub))?FQ_unhex(stub):FQ_unhex('00000000000000000000000000000000');var bh=FQ_unhex(FQ_sm3(bi).substr(0,12));var qh=(q==='')?FQ_unhex(FQ_sm3(FQ_unhex('00000000000000000000000000000000')).substr(0,12)):FQ_unhex(FQ_sm3(q).substr(0,12));var nest=FQ_pbv(1,1)+FQ_pbv(2,1)+FQ_pbv(3,1)+FQ_pbv(7,0xC792ECCC);var s23=FQ_pbb(1,'NX551J')+FQ_pbv(2,8196)+FQ_pbv(4,0x80E0D800);return FQ_pbv(1,1077940818)+FQ_pbv(2,2)+FQ_pbv(3,rv)+FQ_pbb(4,String(aid))+FQ_pbb(5,dev)+FQ_pbb(6,'1611921764')+FQ_pbb(7,FQ_qp(q,'version_name'))+FQ_pbb(8,'v04.04.05-ov-android')+FQ_pbv(9,134744640)+FQ_pbb(10,FQ_unhex('0000000000000000'))+FQ_pbv(11,0)+FQ_pbv(12,ts*2)+FQ_pbb(13,bh)+FQ_pbb(14,qh)+FQ_pbb(15,nest)+FQ_pbb(16,iid)+FQ_pbb(20,'none')+FQ_pbv(21,738)+FQ_pbb(23,s23)+FQ_pbv(25,2);}function FQ_argus(q,stub,ts,dev,iid,aid,rv){var pb=FQ_pad(FQ_argusBean(q,stub,ts,dev,iid,aid,rv));var keys=FQ_srk(FQ_unhex(FQ_SK));var enc='';for(var o=0;o<pb.length;o+=16)enc+=FQ_sEnc(pb.substr(o,16),keys);var magic=FQ_unhex('f2f7fcfff2f7fcff');var un=magic+enc+FQ_unhex('eafb2cfe8568519154');var buf=un.substr(0,8);for(var i=8;i<un.length;i++)buf+=String.fromCharCode((un.charCodeAt(i)^magic.charCodeAt(i%8))&255);var rev='';for(var j=buf.length-1;j>=0;j--)rev+=buf.charAt(j);var fin=FQ_pad(rev+'ao');var ct=FQ_aesCbc(fin,FQ_unhex(FQ_AK),FQ_unhex(FQ_AIV));return FQ_b64(FQ_unhex('f281')+ct);}function FQ_lrk(rp,aid){var dg=FQ_md5(rp+String(aid));var w=[];for(var i=0;i<34;i++)w.push(FQ_w(0,0));w[0]=FQ_r64(dg,0);w[1]=FQ_r64(dg,8);w[2]=FQ_r64(dg,16);w[3]=FQ_r64(dg,24);var b0=w[0],b8=w[1],q=[w[2],w[3]];for(var x=0;x<0x22;x++){var x9=b0;var x8=b8;x8=FQ_ror(x8,8);x8=FQ_add(x8,x9);x8=FQ_xor(x8,FQ_w(x,0));q.push(x8);x8=FQ_xor(x8,FQ_rol(x9,3));w[x+1]=x8;b0=x8;b8=q.shift();}return w;}function FQ_lEnc(blk,keys){var l=FQ_r64(blk,0),r=FQ_r64(blk,8);for(var i=0;i<34;i++){r=FQ_xor(keys[i],FQ_add(l,FQ_ror(r,8)));l=FQ_xor(r,FQ_ror(l,61));}return FQ_w64le2(l,r);}function FQ_ladon(ts,lic,aid,rp){var data=String(ts)+'-'+lic+'-'+aid;var pad2=16-(data.length%16);var pd=data;for(var i=0;i<pad2;i++)pd+=String.fromCharCode(pad2);var ks=FQ_lrk(rp,aid);var ct='';for(var o=0;o<pd.length;o+=16)ct+=FQ_lEnc(pd.substr(o,16),ks);return FQ_b64(rp+ct);}function FQ_sign(q,stub,ts,dev,iid,aid,rv){var h={'x-ss-req-ticket':String(ts*1000),'x-khronos':String(ts),'x-argus':FQ_argus(q,stub,ts,dev,iid,aid,rv),'x-ladon':FQ_ladon(ts,1611921764,aid,String.fromCharCode(1,2,3,4))};if(stub)h['x-ss-stub']=stub;return h;}function FQ_qp(q,k){var ps=String(q||'').split('&');for(var i=0;i<ps.length;i++){var e=ps[i].indexOf('=');if(e>0&&ps[i].substring(0,e)===k)return ps[i].substring(e+1);}return '';}function FQ_qs(url){var t=String(url||'');var i=t.indexOf('?');if(i<0)return '';var j=t.indexOf('#',i);return t.slice(i+1,j<0?t.length:j);}function FQ_qp(url,n){var e=String(n);var ps=FQ_qs(url).split('&');for(var i=0;i<ps.length;i++){if(!ps[i])continue;var s=ps[i].indexOf('=');var k=s<0?ps[i]:ps[i].substr(0,s);if(k===e)return s<0?'':ps[i].substr(s+1);}return '';}function FQ_now(){return Math.floor(new Date().getTime()/1000);}function FQ_ua(){return 'com.dragon.read/66732 (Linux; U; Android 10; zh_CN; Pixel 4 XL; Build/QD1A.190821.007;tt-ok/3.12.13.4-tiktok)';}function FQ_hpost(url,bodyStr,headers){var arr=FQ_s2j(bodyStr);var c=new Packages.java.net.URL(url).openConnection();c.setRequestMethod('POST');c.setDoOutput(true);for(var k in headers)c.setRequestProperty(k,headers[k]);c.setConnectTimeout(20000);c.setReadTimeout(25000);var out=c.getOutputStream();out.write(arr,0,arr.length);out.flush();out.close();var code=c.getResponseCode();var is=(code>=400)?c.getErrorStream():c.getInputStream();var sb='';if(is){var enc=String(c.getHeaderField('Content-Encoding')||'');var stream=is;if(enc.indexOf('gzip')>=0)stream=new Packages.java.util.zip.GZIPInputStream(is);var rd=new Packages.java.io.BufferedReader(new Packages.java.io.InputStreamReader(stream,'UTF-8'));var line;while((line=rd.readLine())!=null)sb+=String(line);rd.close();}return {code:code,body:sb};}function FQ_gz(s){var bos=new Packages.java.io.ByteArrayOutputStream();var g=new Packages.java.util.zip.GZIPOutputStream(bos);var b=new Packages.java.lang.String(s).getBytes(Packages.java.nio.charset.Charset.forName('UTF-8'));g.write(b,0,b.length);g.close();var arr=bos.toByteArray();var out='';for(var i=0;i<arr.length;i++){var v=arr[i]&255;if(i===8)v=2;if(i===9)v=3;out+=String.fromCharCode(v);}return out;}function FQ_ttEnc(data){var rnd='';for(var i=0;i<32;i++)rnd+=String.fromCharCode(Math.floor(Math.random()*256));var md=Packages.java.security.MessageDigest.getInstance('SHA-512');md.update(FQ_s2j(rnd));var inner=md.digest();var md2=Packages.java.security.MessageDigest.getInstance('SHA-512');md2.update(inner);md2.update(FQ_s2j(FQ_b64d(FQ_FIXED)));var hv=md2.digest();var keyB=Packages.java.util.Arrays.copyOfRange(hv,0,16);var ivB=Packages.java.util.Arrays.copyOfRange(hv,16,32);var md3=Packages.java.security.MessageDigest.getInstance('SHA-512');md3.update(FQ_s2j(data));var dh=md3.digest();var C=Packages.javax.crypto.Cipher;var c=C.getInstance('AES/CBC/NoPadding');c.init(C.ENCRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(keyB,'AES'),new Packages.javax.crypto.spec.IvParameterSpec(ivB));return String.fromCharCode(0x74,0x63,0x05,0x10,0,0)+rnd+FQ_j2s(c.doFinal(FQ_s2j(FQ_pad(FQ_j2s(dh)+data))));}function FQ_alnum(n){var ch='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';var s='';for(var i=0;i<n;i++)s+=ch.charAt(Math.floor(Math.random()*ch.length));return s;}function FQ_uuid(){return String(Packages.java.util.UUID.randomUUID());}function FQ_getPool(sv){var p=String(sv.get('fqPool')||'');if(!p){return [];}var out=[];var arr=p.split('|');for(var i=0;i<arr.length;i++){var kv=arr[i].split(',');if(kv.length>=2&&kv[0])out.push({d:kv[0],i:kv[1],o:kv[2]||'',c:kv[3]||''});}return out;}function FQ_savePool(sv,pool){var a=[];for(var i=0;i<pool.length;i++)a.push(pool[i].d+','+pool[i].i+','+(pool[i].o||'')+','+(pool[i].c||''));sv.put('fqPool',a.join('|'));}function FQ_registerOne(){var openudid=FQ_alnum(16),cdid=FQ_uuid(),clientudid=FQ_uuid();var ua='com.dragon.read/65132 (Linux; U; Android 10; zh_CN; MI 12; Build/MMB29M; Cronet/TTNetVersion:9ac8d95c 2024-11-25 QuicVersion:3f326df4 2024-11-14)';var header={display_name:'番茄小说',update_version_code:'65132',manifest_version_code:'65132',aid:1967,channel:'xiaomi_1967_64',package:'com.dragon.read',app_version:'6.5.1.32',version_code:'65132',sdk_version:'v04.04.05-ov-android',sdk_target_version:29,os:'Android',os_version:'10',os_api:'29',device_model:'MI 12',device_brand:'Xiaomi',device_manufacturer:'Google',device_category:'phone',cpu_abi:'arm64-v8a',release_build:FQ_uuid(),density_dpi:'560',display_density:'mdpi',resolution:'1440x2392',language:'zh',mac:'11:22:33:44:55:66',timezone:8,access:'wifi',not_request_sender:0,carrier:'CHINA MOBILE',mcc_mnc:'46007',rom:'EMUI-'+FQ_alnum(13),rom_version:FQ_alnum(2),sig_hash:FQ_md5(FQ_uuid()),openudid:openudid,clientudid:clientudid,sim_serial_number:[],region:'CN',tz_name:'Asia/Shanghai',tz_offset:28800,sim_region:'cn'};var js=JSON.stringify({magic_tag:'ss_app_log',header:header,_gen_time:new Date().getTime()});var post=FQ_ttEnc(FQ_gz(js));var ts=FQ_now();var P=[['tt_data','a'],['os_api','29'],['device_type','MI 12'],['ssmix','a'],['manifest_version_code','65132'],['dpi','560'],['version_name','6.5.1.32'],['ts',String(ts)],['cpu_support64','true'],['app_type','normal'],['appTheme','light'],['ac','wifi'],['host_abi','arm64-v8a'],['update_version_code','65132'],['channel','xiaomi_1967_64'],['_rticket',String(new Date().getTime())],['device_platform','android'],['version_code','65132'],['cdid',cdid],['os','android'],['is_android_pad','0'],['openudid',openudid],['package','com.dragon.read'],['resolution','1440*2392'],['os_version','10'],['language','zh'],['device_brand','Xiaomi'],['need_personal_recommend','1'],['aid','1967'],['minor_status','0'],['app_name','novel'],['mcc_mnc','46007']];P.sort(function(a,b){return a[0]<b[0]?-1:(a[0]>b[0]?1:0);});var qs='';for(var i=0;i<P.length;i++){if(i)qs+='&';qs+=P[i][0]+'='+encodeURIComponent(P[i][1]);}var r=FQ_hpost('https://log.snssdk.com/service/2/device_register/?'+qs,post,{'Content-Type':'application/octet-stream;tt-data=a','accept-encoding':'gzip','user-agent':ua,'connection':'Keep-Alive'});var Q=String.fromCharCode(34);var m=r.body.match(new RegExp(Q+'device_id_str'+Q+':'+Q+'([0-9]+)'+Q));if(!m)return null;var m2=r.body.match(new RegExp(Q+'install_id_str'+Q+':'+Q+'([0-9]+)'+Q));return {d:m[1],i:m2?m2[1]:'',o:openudid,c:cdid};}function FQ_ensure(sv,n){var pool=FQ_getPool(sv);var need=(n||3)-pool.length;var added=0;for(var i=0;i<need;i++){  var d=FQ_registerOne();  if(d){pool.push(d);added++;FQ_savePool(sv,pool);}}return pool;}function FQ_api(jv,sv,path,q,host,aid){var pool=FQ_ensure(sv,2);if(!pool.length)throw new Error('设备池为空，请检查网络后重试');var dev=pool[0].d,iid=pool[0].i;var qq=q+'&iid='+iid+'&device_id='+dev;var url=(host||FQ_HOST)+path+'?'+qq;var ts=FQ_now();var h=FQ_sign(FQ_qs(url),'',ts,dev,iid,aid||1967,Math.floor(Math.random()*2000000000));h['User-Agent']=FQ_ua();return String(jv.ajax(url+','+JSON.stringify({headers:h})));}function FQ_web(jv,url,ua){var h={'User-Agent':ua||FQ_MUA};return String(jv.ajax(url+','+JSON.stringify({headers:h})));}var QC=String.fromCharCode(34);function FQ_state(txt){var t=String(txt||'');var i=t.indexOf('window.__INITIAL_STATE__=');if(i<0)return null;var st0=t.indexOf('{',i);if(st0<0)return null;var seg=t.substring(st0);var depth=0,end=-1,instr=false,esc=false;for(var k=0;k<seg.length;k++){var ch=seg.charAt(k);if(instr){if(esc)esc=false;else if(ch===String.fromCharCode(92))esc=true;else if(ch===QC)instr=false;continue;}if(ch===QC)instr=true;else if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0){end=k+1;break;}}}if(end<0)return null;try{return JSON.parse(seg.substring(0,end));}catch(e){return null;}}function FQ_tag(s){var t=String(s||'');return t.split('<em>').join('').split('</em>').join('').split('<').join('&lt;');}function FQ_search(jv,sv,kw,page){var off=((page||1)-1)*10;var suf='&enterfrom_aid=&enter_from=inner_search&app_name=news_article&version_name=7.0.8&app_version=7.0.8&channel=tt_huawei2019_yz&version_code=708&device_platform=android&parent_enterfrom=novel_list&novel_host=&aid=13&scm_version=1.0.0.4112&device_type=25053RT47C&device_brand=Redmi&language=zh&os_api=35&os_version=15&openudid=fqapp&update_version_code=70899&plugin=0&tma_jssdk_version=1.10.0.0&rom_version=miui__os2.0.209.0.volcnxm';var url='https://api.fanqiesdk.com/api/novel/channel/homepage/search/search/v1/?q='+encodeURIComponent(kw)+'&offset='+off+suf;var raw=FQ_web(jv,url,FQ_FUA);var out=[];try{var d=JSON.parse(raw);var rd=(d.data&&d.data.ret_data)||[];for(var i=0;i<rd.length;i++){var it=rd[i];out.push({name:FQ_tag(it.title),author:FQ_tag(it.author||''),kind:FQ_tag(it.category||''),intro:FQ_tag(it.abstract||''),coverUrl:String(it.thumb_url||''),bookUrl:'https://fanqienovel.com/page/'+it.book_id+FQ_SH+it.book_id,bookId:String(it.book_id)});}}catch(e){}return out;}function FQ_homeList(jv,sv){var raw=FQ_web(jv,'https://fanqienovel.com/','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36');var d=FQ_state(raw);var out=[];if(!d)return out;var hm=d.home||{};var groups=['weekList','editorList','updateList','newbookList','boyList','girlList','readRankList','newRankList','fantasyList','topRankList'];var seen={};for(var g=0;g<groups.length;g++){var arr=hm[groups[g]]||[];for(var i=0;i<arr.length;i++){var it=arr[i];var bid=String(it.bookId||'');if(!bid||seen[bid])continue;seen[bid]=1;out.push({name:String(it.bookName||''),author:String(it.author||''),kind:String(it.category||''),intro:String(it.abstract||''),coverUrl:String(it.thumbUri||''),bookUrl:'https://fanqienovel.com/page/'+bid+FQ_SH+bid});}}return out;}function FQ_rankList(jv,sv,rankId){var raw=FQ_web(jv,FQ_WEB+FQ_SL.concat('api',FQ_SL,'rank',FQ_SL,'list?rank_id=')+(rankId||1)+'&offset=0&count=20');var out=[];try{var d=JSON.parse(raw);var l=(d.data&&d.data.list)||[];for(var i=0;i<l.length;i++){var it=l[i];var bid=String(it.bookId||'');out.push({name:String(it.bookName||''),author:String(it.author||''),kind:'排行榜',intro:String(it.abstract||''),coverUrl:String(it.thumbUri||''),bookUrl:'https://fanqienovel.com/page/'+bid+FQ_SH+bid,bookId:bid});}}catch(e){}return out;}function FQ_getDev(sv){var d=String(sv.get('fqdev')||'');var i=String(sv.get('fqiid')||'');return {d:d,i:i};}function FQ_regAndSave(sv){var r=FQ_regTest();var Q=String.fromCharCode(34);var m=r.match(new RegExp(Q+'device_id_str'+Q+':'+Q+'([0-9]+)'+Q));if(!m)return null;var m2=r.match(new RegExp(Q+'install_id_str'+Q+':'+Q+'([0-9]+)'+Q));var d=m[1],i=m2?m2[1]:'';sv.put('fqdev',d);sv.put('fqiid',i);return {d:d,i:i};}function FQ_bigBytes(n){var h=String(n.toString(16));if(h.length%2===1)h='0'+h;if(h.length>384)h=h.substring(h.length-384);return FQ_unhex(h);}function FQ_b64eJS(str){var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var out='';var i=0;var n=str.length;while(i<n){var c1=str.charCodeAt(i++)&255;var c2=(i<n)?str.charCodeAt(i++)&255:NaN;var c3=(i<n)?str.charCodeAt(i++)&255:NaN;var e1=c1>>2;var e2=((c1&3)<<4)|(isNaN(c2)?0:(c2>>4));var e3=isNaN(c2)?64:(((c2&15)<<2)|(isNaN(c3)?0:(c3>>6)));var e4=isNaN(c3)?64:(c3&63);out+=CH.charAt(e1)+CH.charAt(e2)+(e3===64?'=':CH.charAt(e3))+(e4===64?'=':CH.charAt(e4));}return out;}function FQ_b64dJS(str){var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var out='';var buf=0,bits=0;for(var i=0;i<str.length;i++){var c=str.charAt(i);if(c==='=')break;var v=CH.indexOf(c);if(v<0)continue;buf=(buf<<6)|v;bits+=6;if(bits>=8){bits-=8;out+=String.fromCharCode((buf>>bits)&255);}}return out;}function FQ_b64d2(s){try{return Packages.java.util.Base64.getDecoder().decode(String(s));}catch(e){return FQ_s2j(FQ_b64dJS(String(s)));}}function FQ_b64e2(b){try{return String(Packages.java.util.Base64.getEncoder().encodeToString(b));}catch(e){return FQ_b64eJS(FQ_j2s(b));}}function FQ_bytesHex(b){var str=FQ_j2s(b);var s='';for(var i=0;i<str.length;i++){var v=str.charCodeAt(i)&255;s+=(v<16?'0':'')+v.toString(16);}return s;}function FQ_cmGet(jv,bookId,itemIds,dev,iid){var CMP='ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff';var P=new Packages.java.math.BigInteger(CMP,16);var pk=new Packages.java.math.BigInteger(256,new Packages.java.security.SecureRandom());pk=pk.mod(P.subtract(Packages.java.math.BigInteger.ONE));var pub=Packages.java.math.BigInteger.valueOf(2).modPow(pk,P);var iv=new Packages.java.security.SecureRandom().generateSeed(16);var rk=FQ_b64d2('rCXGfd2POMGzeiNIgo4iLg==');var CC=Packages.javax.crypto.Cipher;var c1=CC.getInstance('AES/CBC/PKCS5Padding');c1.init(CC.ENCRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(rk,'AES'),new Packages.javax.crypto.spec.IvParameterSpec(iv));var ct1=c1.doFinal(FQ_s2j(FQ_bigBytes(pub)));var key=FQ_b64e2(FQ_s2j(FQ_j2s(iv)+FQ_j2s(ct1)));var body=JSON.stringify({book_id:bookId,item_ids:itemIds,key:key});var url='https://novelfm-hl.snssdk.com/novelfm/playerapi/full/mget/v1/?aid=3040&app_name=novelapp&channel=0&device_id='+dev+'&device_platform=android&device_type=UGFFI55&iid='+iid+'&os_version=0&version_code=58932&version_name=5.8.9.32';var ts=FQ_now();var stub=FQ_md5(body);var hh=FQ_sign(FQ_qs(url),stub,ts,dev,iid,3040,Math.floor(Math.random()*2000000000));hh['User-Agent']='com.dragon.read';hh['Content-Type']='application/json; charset=utf-8';var resp=FQ_hpost(url,body,hh);var dd=JSON.parse(resp.body);var infos=dd.data.item_infos;var out={};for(var iid2 in infos){var it=infos[iid2];if(!it||!it.key||!it.content){continue;}var srvHex=FQ_bytesHex(FQ_b64d2(String(it.key)));var srvN=new Packages.java.math.BigInteger(srvHex,16);var shared=srvN.modPow(pk,P);var shHex=String(shared.toString(16));if(shHex.length%2===1)shHex='0'+shHex;if(shHex.length>384)shHex=shHex.substring(shHex.length-384);var aesKey=Packages.java.util.Arrays.copyOfRange(FQ_s2j(FQ_unhex(shHex.substring(0,64))),0,32);var cb=FQ_b64d2(String(it.content));var civ=Packages.java.util.Arrays.copyOfRange(cb,0,16);var cct=Packages.java.util.Arrays.copyOfRange(cb,16,cb.length);var c2=CC.getInstance('AES/CBC/PKCS5Padding');c2.init(CC.DECRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(aesKey,'AES'),new Packages.javax.crypto.spec.IvParameterSpec(civ));var ptArr=c2.doFinal(cct);out[iid2]=String(new Packages.java.lang.String(ptArr,'UTF-8'));}return out;}function FQ_dev(sv){var d=String(sv.get('fqdev')||'');var i=String(sv.get('fqiid')||'');return {d:d,i:i};}function FQ_search(sv,kw,page){var off=String((parseInt(page||'1')-1)*10);var q='q='+encodeURIComponent(kw)+'&offset='+off+'&enterfrom_aid=&enter_from=inner_search&app_name=news_article&version_name=7.0.8&app_version=7.0.8&channel=tt_huawei2019_yz&version_code=708&device_platform=android&parent_enterfrom=novel_list&novel_host=&aid=13&scm_version=1.0.0.4112&device_type=25053RT47C&device_brand=Redmi&language=zh&os_api=35&os_version=15&openudid='+FQ_alnum(16)+'&update_version_code=70899&plugin=0&tma_jssdk_version=1.10.0.0&rom_version=miui__os2.0.209.0.volcnxm';var url='https://api.fanqiesdk.com/api/novel/channel/homepage/search/search/v1/?'+q;var r=String(java.ajax(url+',{"headers":{"User-Agent":"com.ss.android.article.news/13400"}}'));var d=JSON.parse(r);var items=(d.data&&d.data.ret_data)?d.data.ret_data:[];var out=[];for(var i=0;i<items.length;i++){var it=items[i];var t=String(it.title||'').split('<em>').join('').split('</em>').join('');out.push({name:t,author:String(it.author||''),kind:String(it.category||''),intro:String(it.abstract||''),coverUrl:String(it.thumb_url||''),bookUrl:'https://fanqienovel.com/page/'+String(it.book_id)});}return out;}function FQ_toc(sv,bookId,dev){var base='ac=wifi&channel=xiaomi_1967_64&aid=1967&app_name=novelapp&version_code=65132&version_name=6.5.1.32&device_platform=android&os=android&ssmix=a&device_type=FRD-AL10&device_brand=honor&language=zh&os_api=28&os_version=9&manifest_version_code=65132&resolution=1080*1920&dpi=480&update_version_code=65132&pv_player=65132&need_personal_recommend=1&player_so_load=1&is_android_pad_screen=0&host_abi=arm64-v8a&dragon_device_type=phone&compliance_status=0';var url='https://api5-normal-sinfonlineb.fqnovel.com/reading/bookapi/directory/all_items/v?book_type=0&item_data_list_md5=&catalog_data_md5=&book_id='+bookId+'&book_info_md5=&need_version=true&device_id='+dev+'&'+base;var ts=FQ_now();var h=FQ_sign(FQ_qs(url),'',ts,dev,'',1967,Math.floor(Math.random()*2000000000));h['User-Agent']='Mozilla/5.0 (Linux; Android 13)';var r=String(java.ajax(url+','+JSON.stringify({headers:h})));var d=JSON.parse(r);var cats=(d.data&&d.data.catalog_data)?d.data.catalog_data:[];var out=[];for(var i=0;i<cats.length;i++){var c=cats[i];out.push({name:String(c.catalog_title||('第'+(i+1)+'章')),url:String(c.item_id)});}return out;}function FQ_explore(jv,sv,kind,page){var base='ac=wifi&channel=xiaomi_1967_64&aid=1967&app_name=novelapp&version_code=65132&version_name=6.5.1.32&device_platform=android&os=android&ssmix=a&device_type=FRD-AL10&device_brand=honor&language=zh&os_api=28&os_version=9&manifest_version_code=65132&resolution=1080*1920&dpi=480&update_version_code=65132&pv_player=65132&need_personal_recommend=1&player_so_load=1&is_android_pad_screen=0&host_abi=arm64-v8a&dragon_device_type=phone&compliance_status=0';var tt={'推荐':2,'经典':3,'知识':4,'听书':5,'看剧':6,'视频':7,'短篇':8,'漫画':9,'买书':10};var tabType=tt[kind]||2;var off=((parseInt(page||'1')-1)*16);var q='tab_type='+tabType+'&offset='+off+'&client_template=0&'+base;var raw=FQ_api(jv,sv,'/reading/bookapi/bookmall/tab/v',q);var d=JSON.parse(raw);var ti=d.data.tab_item||[];var out=[];for(var t=0;t<ti.length;t++){var cells=ti[t].cell_data||[];for(var c=0;c<cells.length;c++){var bd=cells[c].book_data||[];for(var b=0;b<bd.length;b++){var it=bd[b];var bid=String(it.book_id||'');if(!bid)continue;out.push({name:String(it.book_name||''),author:String(it.author||''),kind:String(it.category||''),intro:String(it.abstract||''),coverUrl:String(it.thumb_url||''),bookUrl:'https://fanqienovel.com/page/'+bid+FQ_SH+bid});}}}return out;}function FQ_pickBooks(jv,sv,catId,algo,page){var base='ac=wifi&channel=xiaomi_1967_64&aid=1967&app_name=novelapp&version_code=65132&version_name=6.5.1.32&device_platform=android&os=android&ssmix=a&device_type=FRD-AL10&device_brand=honor&language=zh&os_api=28&os_version=9&manifest_version_code=65132&resolution=1080*1920&dpi=480&update_version_code=65132&pv_player=65132&need_personal_recommend=1&player_so_load=1&is_android_pad_screen=0&host_abi=arm64-v8a&dragon_device_type=phone&compliance_status=0';var off=((parseInt(page||'1')-1)*16);var q='cell_id=7098235271900037133&offset='+off+'&client_template=2&client_req_type=2&tab_type=2&req_rank_category_id='+catId+'&req_rank_algo='+(algo||101)+'&'+base;var raw=FQ_api(jv,sv,'/reading/bookapi/bookmall/cell/change/v1/',q);var d=JSON.parse(raw);var cv=(d.data&&d.data.cell_view)||{};var bd=cv.book_data||[];var out=[];for(var i=0;i<bd.length;i++){var it=bd[i];var bid=String(it.book_id||'');if(!bid)continue;out.push({name:String(it.book_name||''),author:String(it.author||''),kind:String(it.category||''),intro:String(it.abstract||''),coverUrl:String(it.thumb_url||''),bookUrl:'https://fanqienovel.com/page/'+bid+FQ_SH+bid});}return out;}function FQ_tabBooks(jv,sv,tabType,page){var base='ac=wifi&channel=xiaomi_1967_64&aid=1967&app_name=novelapp&version_code=65132&version_name=6.5.1.32&device_platform=android&os=android&ssmix=a&device_type=FRD-AL10&device_brand=honor&language=zh&os_api=28&os_version=9&manifest_version_code=65132&resolution=1080*1920&dpi=480&update_version_code=65132&pv_player=65132&need_personal_recommend=1&player_so_load=1&is_android_pad_screen=0&host_abi=arm64-v8a&dragon_device_type=phone&compliance_status=0';var off=((parseInt(page||'1')-1)*16);var q='tab_type='+tabType+'&offset='+off+'&client_template=0&'+base;var raw=FQ_api(jv,sv,'/reading/bookapi/bookmall/tab/v',q);var d=JSON.parse(raw);var ti=d.data.tab_item||[];var out=[];var seen={};for(var t=0;t<ti.length;t++){var cells=ti[t].cell_data||[];for(var c=0;c<cells.length;c++){var bd=cells[c].book_data||[];for(var b=0;b<bd.length;b++){var it=bd[b];var bid=String(it.book_id||'');if(!bid||seen[bid])continue;seen[bid]=1;out.push({name:String(it.book_name||''),author:String(it.author||''),kind:String(it.category||''),intro:String(it.abstract||''),coverUrl:String(it.thumb_url||''),bookUrl:'https://fanqienovel.com/page/'+bid+FQ_SH+bid});}}}return out;}function FQ_dhGet(jv,itemId,dev,iid){var P=new Packages.java.math.BigInteger(FQ_DHP,10);var a=new Packages.java.math.BigInteger(256,new Packages.java.security.SecureRandom());var pub=Packages.java.math.BigInteger.valueOf(2).modPow(a,P);var ivB=new Packages.java.security.SecureRandom().generateSeed(16);var keyB=FQ_b64d2('rCXGfd2POMGzeiNIgo4iLg==');var CC=Packages.javax.crypto.Cipher;var c1=CC.getInstance('AES/CBC/NoPadding');c1.init(CC.ENCRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(keyB,'AES'),new Packages.javax.crypto.spec.IvParameterSpec(ivB));var ctB=c1.doFinal(FQ_s2j(FQ_pad(FQ_j2s(pub.toByteArray()))));var blob=new Packages.java.io.ByteArrayOutputStream();blob.write(ivB);blob.write(ctB);var y=FQ_b64e2(blob.toByteArray());var url=FQ_DHU+'&item_id='+itemId;var hh=FQ_sign(FQ_qs(url),'',FQ_now(),dev,iid,13,Math.floor(Math.random()*2000000000));hh['User-Agent']='com.ss.android.article.news/13400 (Linux; U; Android 10; zh_CN; tb8788p1_64_bsp; Build/QQ3A.200805.001; Cronet/TTNetVersion:fc4cebd3 2024-12-10 QuicVersion:d9628e3d 2024-10-11)';hh['y']=y;var res=FQ_hget(url,hh);if(res.code!==200){throw new Error('正文通道 HTTP '+res.code);}var sc=res.c,dc='';try{var o=JSON.parse(res.body);if(o&&o.data&&o.data.content)dc=o.data.content;}catch(e){}if((sc==='1'||sc==='')&&dc)sc=dc;if(!res.y||!sc){throw new Error('正文通道缺少解密参数');}var s=new Packages.java.math.BigInteger(1,FQ_b64d2(res.y)).modPow(a,P);var sB=s.toByteArray();var i=0;while(i<sB.length-1&&sB[i]===0)i++;sB=Packages.java.util.Arrays.copyOfRange(sB,i,sB.length);if(sB.length<32){throw new Error('正文通道共享密钥过短');}var cb=FQ_b64d2(sc);if(cb.length<32){throw new Error('正文通道密文过短');}var c2=CC.getInstance('AES/CBC/NoPadding');c2.init(CC.DECRYPT_MODE,new Packages.javax.crypto.spec.SecretKeySpec(Packages.java.util.Arrays.copyOfRange(sB,0,32),'AES'),new Packages.javax.crypto.spec.IvParameterSpec(Packages.java.util.Arrays.copyOfRange(cb,0,16)));var pt=c2.doFinal(Packages.java.util.Arrays.copyOfRange(cb,16,cb.length));var n=pt.length,p=pt[n-1]&0xFF;if(p>0&&p<=16&&p<=n)pt=Packages.java.util.Arrays.copyOfRange(pt,0,n-p);return String(new Packages.java.lang.String(pt,Packages.java.nio.charset.Charset.forName('UTF-8')));}
var FQ_DHP='2410312426921032588552076022197566074856950548502459942654116941958108831682612228890093858261341614673227141477904012196503648957050582631942730706805009223062734745341073406696246014589361659774041027169249453200378729434170325843778659198143763193776859869524088940195577346119843545301547043747207749969763750084308926339295559968882457872412993810129130294592999947926365264059284647209730384947211681434464714438488520940127459844288859336526896320919633919';
var FQ_DHU='https://novel.snssdk.com/api/novel/book/reader/content/v1?aid=13&app_name=novelapp&channel=0&device_platform=android&device_type=25053RT47C&os_version=10&support_image=1&version_code=66.9';
function FQ_hget(url,headers){var c=new Packages.java.net.URL(url).openConnection();c.setRequestMethod('GET');for(var k in headers)c.setRequestProperty(k,headers[k]);c.setConnectTimeout(20000);c.setReadTimeout(25000);var code=c.getResponseCode();var is=(code>=400)?c.getErrorStream():c.getInputStream();var sb='';if(is){var enc=String(c.getHeaderField('Content-Encoding')||'');var st=is;if(enc.indexOf('gzip')>=0)st=new Packages.java.util.zip.GZIPInputStream(is);var rd=new Packages.java.io.BufferedReader(new Packages.java.io.InputStreamReader(st,'UTF-8'));var line;while((line=rd.readLine())!=null)sb+=String(line);rd.close();}return {code:code,body:sb,y:String(c.getHeaderField('y')||''),c:String(c.getHeaderField('c')||'')};}