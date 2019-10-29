const path = require('path');
const webpack = require('webpack');
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length});

const resolvePath = (dir) => {
    return path.resolve(__dirname, './', dir);
};

let baseConfig = {
    resolve: {
        alias: {
            js: resolvePath('src/js'),
            css: resolvePath('src/css'),
            tpl: resolvePath('src/tpl'),
            lib: resolvePath('lib')
        }
    },
    performance: {
        maxAssetSize: 400000,
        maxEntrypointSize: 400000
    },
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'img/[name].[hash:7].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|svg)(\?[a-z0-9#]*)?$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1,
                            name: 'fonts/[name].[hash:7].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.ejs$/i,
                use: 'happypack/loader?id=ejs'
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'happypack/loader?id=jsbabel'
            }
        ]
    },
    plugins: [
        new ProgressBarWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new HappyPack({
            id: 'ejs',
            loaders: [
                'ejs-compiled-loader?cacheDirectory=true'
            ],
            threadPool: happyThreadPool,
            verbose: true,
            threads: 4
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, 'src/img'),
                to: 'img'
            },
            {
                from: path.join(__dirname, 'lib/img'),
                to: 'img'
            }
        ], {}),
        new HappyPack({
            id: 'jsbabel',
            loaders: [
                'babel-loader?cacheDirectory=true'
            ],
            threadPool: happyThreadPool,
            verbose: true,
            // 开启四个线程
            threads: 4
        })
    ]
};

module.exports = baseConfig;
