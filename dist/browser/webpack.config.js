module.exports = {
    entry: "./csidh-wasm.js",
    mode: "production",
    output: {
        path: __dirname + '/',
        library: 'csidh',
        libraryTarget: 'umd',
        filename: 'csidh-wasm.js'
    },
    /*
      resolve: {
        fallback: {
          path: false,
          fs: false,
          crypto: false,
        },
      },
    */
    target: "web"
};