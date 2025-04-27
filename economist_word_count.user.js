// ==UserScript==
// @name         经济学人文章英文单词数统计
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  统计 #new-article-template > div 下英文单词数量并显示在右上角
// @author       Lynn
// @match        https://www.economist.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 找到文章节点
    const article = document.querySelector('#new-article-template > div');
    if (!article) {
        console.log('未找到文章内容');
        return;
    }

    // 提取文本并统计英文单词
    const text = article.innerText || article.textContent || "";
    const words = text.match(/\b[a-zA-Z]+\b/g);
    const wordCount = words ? words.length : 0;

    // 创建一个固定显示的小div
    const counterDiv = document.createElement('div');
    counterDiv.textContent = `Word Count: ${wordCount}`;
    counterDiv.style.position = 'fixed';
    counterDiv.style.top = '10px';
    counterDiv.style.right = '10px';
    counterDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    counterDiv.style.color = 'white';
    counterDiv.style.padding = '8px 12px';
    counterDiv.style.borderRadius = '8px';
    counterDiv.style.fontSize = '14px';
    counterDiv.style.zIndex = '9999';
    counterDiv.style.fontFamily = 'Arial, sans-serif';

    document.body.appendChild(counterDiv);
})();
