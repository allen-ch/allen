# pc
本仓库PC项目源码。打包工具使用[webpack](https://webpack.github.io)。

## 开发环境

执行以下命令即可启动 webpack 开发调试服务器，可在浏览器输入http://localhost:8080预览项目文件：

```
npm run dev
```

服务端口默认为8080，如果因为8080端口被占用而希望启用其他端口，需要追加端口参数配置，如下：

```
npm run dev --port=8082
```

修改代码后保存，会根据代码的修改情况进行自动热替换／刷新页面。

### 生产环境

```
npm run build        # 打包后无sourceMap，资源压缩
npm run build:debug  # 打包后包含sourceMap，资源未压缩
```