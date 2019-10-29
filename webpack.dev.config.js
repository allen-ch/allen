const path = require('path');
const glob = require('glob');
const open = require('open');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length});

const resolvePath = (dir) => {
    return path.resolve(__dirname, './', dir);
};

const argv = JSON.parse(process.env.npm_config_argv).cooked;
let argvIndex = param => {
    return argv.indexOf(param);
};

let port = argvIndex('--port') === -1 ? 8080 : argv[argvIndex('--port') + 1] || 8080;
let entries = (entryPath => {
    let files = {},
        excludes = [],
        filesPath,
        ignoreDirs = ['lib', 'commons', 'components'];
    ignoreDirs.forEach(dir => {
        excludes.push(path.join(entryPath, '/**/' + dir + '/**/*.js'));
    });
    filesPath = glob.sync(`${entryPath}/**/*.js`, {
        ignore: excludes
    });
    filesPath.forEach((entry, index) => {
        let chunkName = path.relative(entryPath, entry).replace(/\.js$/i, '');
        files[chunkName] = entry;
    });
    return files;
})(resolvePath('src/js'));
let pages = Object.keys(entries);
let devConfig = webpackMerge(baseWebpackConfig, {
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'js/[name].[hash:7].js'
    },
    devServer: {
        host: '::',
        contentBase: path.join(__dirname, 'dist'),
        watchContentBase: true,
        disableHostCheck: true,
        compress: true,
        port: port,
        overlay: {
            warnings: false,
            errors: true
        },
        stats: {
            colors: true,
            chunks: false,
            children: false,
            entrypoints: false,
            modules: false
        },
        before: function (app, server) {
            app.get('/', (req, res) => {
                var resHtml = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>index</title>
                </head>
                <body>
                    <ul>`;
                for (let key in entries) {
                    if (key !== 'framework') {
                        resHtml += `<li><a href="pages/${key}.html">pages/${key}.html</a></li>`;
                    }
                }
                resHtml += `</ul>
                </body>
                </html>`;
                res.send(resHtml);
            });
            const chokidar = require('chokidar');
            const files = [path.join(__dirname, 'src/tpl/**/*.ejs'), path.join(__dirname, 'lib/**/*.ejs')];
            const options = {
                followSymlinks: false,
                depth: 5
            };
            let watcher = chokidar.watch(files, options);
            watcher.on('all', _ => {
                server.sockWrite(server.sockets, 'content-changed');
            });
        },
        after: function () {
            open(`http://localhost:${port}`);
        }
    },
    devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(c|sa|sc)ss$/,
                use: [
                    'css-hot-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    remove: false
                                })
                            ]
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: 'happypack/loader?id=jseslint'
            }
        ]
    },
    optimization: {
        // splitChunks: {
        //     chunks: 'all',
        //     minSize: 30000,
        //     maxSize: 0,
        //     minChunks: 1,
        //     maxAsyncRequests: 5,
        //     maxInitialRequests: 2,
        //     name: false,
        //     cacheGroups: {
        //         vendors: {
        //             name: 'vendors',
        //             reuseExistingChunk: true,
        //             minChunks: pages.length - 1,
        //             test: /[\\/](node_modules)|(lib)[\\/]/
        //         }
        //     }
        // },
        runtimeChunk: {
            name: 'manifest'
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new webpack.NamedModulesPlugin(),
        new StyleLintPlugin(),
        new HappyPack({
            id: 'jseslint',
            loaders: [
                'eslint-loader?cacheDirectory=true'
            ],
            threadPool: happyThreadPool,
            verbose: true,
            threads: 4
        })
    ]
});

pages.forEach(item => {
    if (item !== 'framework') {
        devConfig.plugins.push(new HtmlWebpackPlugin({
            filename: resolvePath(`dist/pages/${item}.html`),
            template: resolvePath(`src/tpl/${item}.ejs`),
            chunks: ['manifest', 'vendors', 'framework', item],
            heads: ['manifest', 'vendors', 'framework'],
            bodys: [item],
            inject: false
        }));
    }
});

module.exports = devConfig;
