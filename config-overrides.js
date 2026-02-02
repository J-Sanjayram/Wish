const path = require('path');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "onnxruntime-web/webgpu": false,
    "onnxruntime-web": require.resolve("onnxruntime-web")
  };
  
  return config;
};