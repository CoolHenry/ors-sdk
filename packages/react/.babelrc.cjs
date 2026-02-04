module.exports = (api) => {
  if (api.env("test")) {
    return {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-typescript", { allowDeclareFields: true }],
      ],
    };
  }
  return { presets: [["@babel/preset-env"]] };
};
