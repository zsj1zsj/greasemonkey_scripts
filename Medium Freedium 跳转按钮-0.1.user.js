// ==UserScript==
// @name         Medium Freedium 跳转按钮
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  给 Medium 页面添加跳转到 freedium.cfd 的按钮
// @author       Lynn
// @match        https://*.medium.com/*
// @match        https://medium.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 检查是否为有效文章页面（可按需放宽限制）
    const currentUrl = window.location.href;
    if (!currentUrl.includes('medium.com/')) {
    return;
    }
    // 创建按钮
    const button = document.createElement('button');
    button.innerText = '跳转 Freedium';
    button.style.position = 'fixed';
    button.style.top = '80px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#00ab6c';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';

    // 点击事件
    button.onclick = function () {
        const targetUrl = 'https://freedium.cfd/' + currentUrl;
        window.open(targetUrl, '_blank');
    };

    // 添加按钮到页面
    document.body.appendChild(button);
})();