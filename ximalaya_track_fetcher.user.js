// ==UserScript==
// @name         Ximalaya Track Fetcher
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fetch data from Ximalaya API
// @author       Lynn Zhang
// @match        https://www.ximalaya.com/sound/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 解密相关
    const key = "aaad3e4fd540b0f79dca95606e72bf93";
    function decryptUrl(ciphertext) {
        return CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Base64url.parse(ciphertext) },
            CryptoJS.enc.Hex.parse(key),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            }
        ).toString(CryptoJS.enc.Utf8);
    }

    // Extract important cookies from the provided cookie string
    const cookies = '';

    // Headers based on the curl command
    const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en,zh;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,ja;q=0.6',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
    };

    // Function to format cookie string
    function formatCookieString(cookieObj) {
        return Object.entries(cookieObj)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    // Function to extract track ID from URL
    function getTrackIdFromUrl() {
        const match = window.location.pathname.match(/\/sound\/(\d+)/);
        return match ? match[1] : null;
    }

    // Function to show the audio URL in a more visible way
    function showAudioUrl(encryptedUrl, decryptedUrl) {
        // Create or find the result display element
        let resultDisplay = document.getElementById('ximalaya-url-display');
        if (!resultDisplay) {
            resultDisplay = document.createElement('div');
            resultDisplay.id = 'ximalaya-url-display';
            resultDisplay.style.cssText = `
                position: fixed;
                top: 60px;
                right: 10px;
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                z-index: 9999;
                max-width: 500px;
                word-break: break-all;
            `;
            document.body.appendChild(resultDisplay);
        }

        // Create elements for displaying and copying URL
        resultDisplay.innerHTML = `
            <div>加密音频URL:</div>
            <div style="margin: 5px 0; font-size: 12px;">${encryptedUrl}</div>
            <div style="margin-top: 10px;">解密音频URL:</div>
            <div style="margin: 5px 0; font-size: 12px;">${decryptedUrl}</div>
            <div style="margin-top: 5px; color: green; font-size: 12px;">✓ 已自动复制解密URL到剪贴板</div>
            <button id="copy-encrypted-btn" style="margin-top: 5px; margin-right: 5px;">复制加密URL</button>
            <button id="copy-decrypted-btn" style="margin-top: 5px;">复制解密URL</button>
        `;

        // Add copy functionality for encrypted URL
        document.getElementById('copy-encrypted-btn').addEventListener('click', () => {
            GM_setClipboard(encryptedUrl);
            alert('加密URL已复制到剪贴板');
        });

        // Add copy functionality for decrypted URL
        document.getElementById('copy-decrypted-btn').addEventListener('click', () => {
            GM_setClipboard(decryptedUrl);
            alert('解密URL已复制到剪贴板');
        });

        // 自动复制解密后的URL到剪贴板
        GM_setClipboard(decryptedUrl);
    }

    // Function to fetch data from Ximalaya API
    function fetchXimalayaData() {
        const trackId = getTrackIdFromUrl();
        if (!trackId) {
            console.error('No track ID found in URL');
            return;
        }

        const url = `https://www.ximalaya.com/mobile-playpage/track/v3/baseInfo/54157194?device=web&trackId=${trackId}&trackQualityLevel=1`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                ...headers,
                'Cookie': formatCookieString(cookies)
            },
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    const encryptedUrl = data?.trackInfo?.playUrlList?.[0]?.url;

                    if (encryptedUrl) {
                        console.log('Encrypted URL:', encryptedUrl);
                        const decryptedUrl = decryptUrl(encryptedUrl);
                        console.log('Decrypted URL:', decryptedUrl);
                        showAudioUrl(encryptedUrl, decryptedUrl);
                    } else {
                        console.error('Audio URL not found in response');
                        showAudioUrl('未找到音频URL', '未找到音频URL');
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    showAudioUrl('解析响应时出错', '解析响应时出错');
                }
            },
            onerror: function(error) {
                console.error('Error fetching data:', error);
                showAudioUrl('获取数据时出错', '获取数据时出错');
            }
        });
    }

    // Add a button to trigger the fetch
    function addFetchButton() {
        const button = document.createElement('button');
        button.textContent = '获取音频URL';
        button.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px;';

        button.addEventListener('click', fetchXimalayaData);
        document.body.appendChild(button);
    }

    // Initialize
    addFetchButton();
})();
