#!/usr/bin/env node

// 通过命令行获取用户的输入信息
// 根据用户输入结果生成文件

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const ejs = require("ejs");

inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "project name?",
    },
  ])
  .then((anwsers) => {
    // 模板目录
    const tempDir = path.join(__dirname, "templates");
    // 目标目录
    const destDir = process.cwd();

    // 读取模板输出
    fs.readdir(tempDir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        ejs.renderFile(path.join(tempDir, file), anwsers, (err, result) => {
          if (err) throw err;
          fs.writeFileSync(path.join(destDir, file), result);
        });
      });
    });
  });
