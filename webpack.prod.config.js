const path = require('path');
const glob = require('glob');
const webpackMerge = require('webpack-merge');
const argv = require('yargs').argv;
const baseWebpackConfig = require('./webpack.base.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const hashedChunkIdPlugin = require('webpack-hashed-chunkid');

const resolvePath = (dir) => {
    return path.resolve(__dirname, './', dir);
};

let prodMode = argv.mode === 'production';

let entries = (entryPath => {
    let files = {},
        excludes = [],
        filesPath,
        ignoreDirs = ['lib', 'commons', 'components'];

    ignoreDirs.forEach(dir => {
        excludes.push(path.join(entryPath, '/**/' + dir + '/**/*.js'));
    });

    filesPath = glob.sync(entryPath + '/**/*.js', {
        ignore: excludes
    });

    filesPath.forEach((entry, index) => {
        let chunkName = path.relative(entryPath, entry).replace(/\.js$/i, '');
        files[chunkName] = entry;
    });
    files.framework = [path.resolve(__dirname, './lib/js/z-framework.js')];
    return files;
})(resolvePath('src/js'));

let pages = Object.keys(entries);

let prodConfig = webpackMerge(baseWebpackConfig, {
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: './dist/',
        filename: 'js/[name].[contenthash:7].js'
    },
    devtool: prodMode ? '' : 'source-map',
    stats: {
        colors: true,
        chunks: false,
        children: false,
        entrypoints: false,
        modules: false
    },
    module: {
        rules: [
            {
                test: /\.(c|sa|sc)ss$/,
                use: [
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
            }
        ]
    },
    optimization: {
        moduleIds: 'hashed',
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 2,
            name: false,
            cacheGroups: {
                vendors: {
                    name: 'vendors',
                    reuseExistingChunk: true,
                    minChunks: pages.length - 1,
                    test: /[\\/](node_modules)|(lib)[\\/]/
                }
            }
        },
        runtimeChunk: {
            name: 'manifest'
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:7].css'
        }),
        new ManifestPlugin({
            publicPath: '',
            filter: function (FileDescriptor) {
                return FileDescriptor.isChunk;
            }
        }),
        new hashedChunkIdPlugin()
    ]
});

// css minimizer
if (prodMode) {
    prodConfig.optimization.minimizer = [
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: false
        }),
        new UglifyJsPlugin({
            test: /\.js$/,
            cache: true,
            parallel: true,
            uglifyOptions: {
                compress: {
                    drop_debugger: true,
                    drop_console: true,
                    unused: false
                }
            }
        })
    ];
}

// BundleAnalyzer
if (argv.ba) {
    prodConfig.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 8889,
        reportFilename: 'report.html',
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: null,
        logLevel: 'info'
    }));
}

// push HtmlWebpackPlugin every page 
pages.forEach(item => {
    if (item !== 'framework') {
        prodConfig.plugins.push(new HtmlWebpackPlugin({
            filename: resolvePath(`dist/pages/${item}.html`),
            template: resolvePath(`src/tpl/${item}.ejs`),
            chunks: ['manifest', 'vendors', 'framework', item],
            heads: ['manifest', 'vendors', 'framework'],
            bodys: [item],
            inject: false
        }));
    }
});

module.exports = prodConfig;
