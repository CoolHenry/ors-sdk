module.exports = {
  useTabs: false, // 使用tab缩进还是空格缩进，false表示空格缩进
  tabWidth: 2, // tab是空格的情况下，是几个空格
  jsxSingleQuote: true, // jsx 不使用单引号，而使用双引号
  jsxBracketSameLine: true, // jsx 标签的反尖括号需要换行
  printWidth: 150, // 一行最多 120 字符
  singleQuote: true, // 使用单引号
  trailingComma: "es5", // 对象末尾不需要逗号
  bracketSpacing: true, // 大括号内的首尾需要空格
  vueIndentScriptAndStyle: true, // 表示.vue文件中，<script>和<style>标签中的代码缩进两个单元格
  semi: true, // 语句末尾是否要加分号，默认值true，选择false表示不加
  endOfLine: "auto",
  arrowParens: "always",
};
