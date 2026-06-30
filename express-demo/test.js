// 引入express和cors库
const express = require("express")
const cors = require("cors")
// path用于处理文件路径
const path = require("path")
// fs文件系统模块，可以对文件进行读写操作
const fs = require("fs")

// 创建项目实例
const app = express()
const PORT = 3000 // 设置端口号

app.use(cors()) // 把cors注册到app实例中
// 前端传来的数据是JSON类型(请求体)，后端处理的数据是JS类型（类型转换）
app.use(express.json())
// ?activeId=3000164247865&classId=148497347（查询字符串：一般用于表单提交）
// 一般url解析的是字符串和数组（extended默认值为false），extended设置为true后就可以解析?activeId=3000164247865&classId=148497347
app.use(express.urlencoded({extended: true}))

// HTTP请求方法：GET(获取数据)、POST（提交数据）
// app.get(要处理的请求路径, 请求路径对应的回调函数) 浏览器访问请求路径时，处理回调函数
// "/"表示当前路径 http://localhost:3000/
app.get("/", (req, res)=>{
    // req请求对象
    // res响应对象
    console.log(11111) // 解决转圈圈：要给浏览器响应
    console.log("请求头信息：", req.headers)
    // connection: 'keep-alive':长连接
    console.log("获取HTTP请求方法: ", req.method)
    console.log("获取请求的URL路径: ", req.url)
    console.log("获取客户端的IP地址: ", req.ip)
    // ::1表示ipv6的本地回环地址，ipv4的127.0.0.1
    res.send("helloworld")
})

app.get("/list", (req, res)=>{
    // http://localhost:3000/list?page=1&size=10
    console.log(req.query) // { page: '1', size: '10' }
    // 逻辑：利用page和size数据查询数据库，把数据响应给浏览器
    // 解构：
    let {page, size} = req.query
    console.log(page, size)
    res.send(page, size)
})

// 把注册界面从后端服务器中传送到浏览器（客户端要数据: get）
app.get("/register", (req, res)=>{
    // 逻辑
    // 1 先拿到register.html路径
    let filePath = path.join(__dirname, "views", "register.html")
    // 2 再提取register.html文件数据
    let content = fs.readFileSync(filePath, "utf-8")
    // 3 发送register.html文件数据到浏览器
    res.send(content)
})

// 点击“注册提交”后，表单数据会从浏览器POST到后端服务器
app.post("/register", (req, res)=>{
    // 数据携带在请求体中
    console.log(req.body) // { username: '1', email: '1', password: '1', repwd: '1' }
    // 解构
    let {username, email, password, repwd } = req.body

    // 注册常见逻辑：
    // 1 验证传来的参数是否为空，如果为空返回“注册失败”
    // 2 查询数据库，看这个人是否被注册了，如果被注册则返回“该用户已被注册”
    // 3 常规表单校验（email是否正确，password, repwd是否一致）
    // 4 对密码加密
    // 5 把所有数据存在数据库中，返回注册成功

    res.send("注册成功")
})


// 启动服务器
app.listen(PORT, ()=>{
    console.log("服务器启动到" + PORT + "端口上了！")
})