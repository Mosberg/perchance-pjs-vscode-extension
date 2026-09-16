importScripts("https://unpkg.com/comlink@4.4.1/dist/umd/comlink.js");
        
let extractors = {};

async function loadModel(modelName) {
    if (!self.pipeline) {
      let { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
      env.allowLocalModels = false;
      self.pipeline = pipeline;
    }
    if (!extractors[modelName]) {
        extractors[modelName] = await pipeline('feature-extraction', modelName);
    }
}

async function extractFeatures(text, modelName) {
    await loadModel(modelName);
    const extractor = extractors[modelName];
    const result = await extractor(text, { pooling: 'mean', normalize: true });
    return result.data;
}

Comlink.expose({ extractFeatures });

