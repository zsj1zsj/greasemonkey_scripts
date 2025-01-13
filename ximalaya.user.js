// ==UserScript==
// @name         Fetch JSON with xm-sign
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fetch JSON data using xm-sign in Ximalaya
// @author       Lynn Zhang
// @match        https://www.ximalaya.com/album/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const n = "t6pfoml9679z52kqw93uqu75eflqdg1bykhl";
    const o = "h5_goyxvzyohd";
    let a = "";

    // Load external SDK if not already loaded
    function loadSDK() {
        return new Promise((resolve, reject) => {
            if (window.du_web_sdk) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = "https://s1.xmcdn.com/yx/static-source/last/dist/js/dws1.7.4.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }
        });
    }

    // Get Browser ID
    function dwsGetBrowserId() {
        if (window.du_web_sdk) {
            return a
                ? Promise.resolve(a)
                : new Promise((resolve, reject) => {
                      window.du_web_sdk.getBrowserID(n, o, "", (result) => {
                          if (result) a = result;
                          resolve(result || "");
                      });
                  });
        }
        return Promise.resolve(a);
    }

    // Get Session ID
    function dwsGetSessionID() {
        if (window.du_web_sdk) {
            return new Promise((resolve, reject) => {
                window.du_web_sdk.getSessionID(n, o, "", (result) => {
                    resolve(result || "");
                });
            });
        }
        return Promise.resolve("");
    }

// Fetch JSON Data
async function fetchJSONData() {
    await loadSDK();

    // 获取当前 URL 中的 albumId
    const match = window.location.href.match(/\/album\/(\d+)/);
    if (!match || !match[1]) {
        alert("未能从 URL 中解析到 albumId");
        return;
    }
    const albumId = match[1];
    console.log(`Detected albumId: ${albumId}`);

    const cookie = ''

    const pageSize = 100; // 每页的条目数
    let totalTracks = [];
    let trackTotalCount = 0;
    let totalPages = 0;

    try {
        // 获取第一页数据，同时确定总条目数和总页数
        const firstResponse = await fetchWithXmSign(
            `https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${albumId}&pageNum=1&pageSize=${pageSize}`,
            cookie
        );

        trackTotalCount = firstResponse.data.trackTotalCount;
        console.log(`Total tracks: ${trackTotalCount}`);
        totalPages = Math.ceil(trackTotalCount / pageSize);
        console.log(`Total pages: ${totalPages}`);

        // 合并第一页数据
        totalTracks = totalTracks.concat(firstResponse.data.tracks);

        // 遍历其他页
        for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
            const response = await fetchWithXmSign(
                `https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${albumId}&pageNum=${pageNum}&pageSize=${pageSize}`,
                cookie
            );

            totalTracks = totalTracks.concat(response.data.tracks);
            console.log(`Fetched page ${pageNum}:`, response.data.tracks);
        }

        console.log("All Fetched Data:", totalTracks);
        

        // 将所有 JSON 数据复制到剪贴板
        await navigator.clipboard.writeText(JSON.stringify(totalTracks, null, 2));
        alert(`Fetch Success: Retrieved ${totalTracks.length} tracks, All JSON data copied to clipboard!`);
    } catch (error) {
        console.error("Fetch Error:", error);
        alert(`Fetch Error: ${error.message}`);
    }
}

// 新的 fetchWithXmSign 方法，用于在每次请求前获取 xm-sign
async function fetchWithXmSign(url, cookie) {
    const [browserId, sessionId] = await Promise.all([
        dwsGetBrowserId(),
        dwsGetSessionID(),
    ]);

    const xmSign = `${browserId}&&${sessionId}`;
    console.log(`Generated xm-sign: ${xmSign}`);

    const response = await fetch(url, {
        credentials: "include",
        headers: {
            Accept: "*/*",
            "Accept-Language": "en,zh;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            DNT: "1",
            Referer: url,
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "xm-sign": xmSign,
            Cookie: cookie,
        },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
}


    // Add a button to trigger the script
    const button = document.createElement("button");
    button.innerText = "Fetch JSON with xm-sign";
    button.style.position = "fixed";
    button.style.bottom = "10px";
    button.style.right = "10px";
    button.style.zIndex = "10000";
    button.onclick = fetchJSONData;
    document.body.appendChild(button);
})();
