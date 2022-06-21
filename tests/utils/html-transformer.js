module.exports = {
  process(source) {
    return {
      code: `module.exports = ${JSON.stringify(source)};`,
    };
  },
};
