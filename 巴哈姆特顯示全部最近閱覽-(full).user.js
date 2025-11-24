// ==UserScript==
// @name         巴哈姆特顯示全部最近閱覽
// @namespace    巴哈姆特顯示全部最近閱覽-Johnson8033
// @version      1.7(full)
// @author       Johnson8033
// @description  在原本位置增加全部最近閱覽
// @match        https://www.gamer.com.tw/*
// @match        https://forum.gamer.com.tw/*
// @icon         https://i2.bahamut.com.tw/favicon.svg?v=1689129528
// @require      https://unpkg.com/@popperjs/core@2
// @require      https://unpkg.com/tippy.js@6
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @license      MIT
// @downloadURL  https://github.com/Johnson80331/Return-Bahamut-Recent-Pages/raw/refs/heads/main/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E9%A1%AF%E7%A4%BA%E5%85%A8%E9%83%A8%E6%9C%80%E8%BF%91%E9%96%B1%E8%A6%BD-(full).user.js
// @updateURL    https://github.com/Johnson80331/Return-Bahamut-Recent-Pages/raw/refs/heads/main/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E9%A1%AF%E7%A4%BA%E5%85%A8%E9%83%A8%E6%9C%80%E8%BF%91%E9%96%B1%E8%A6%BD-(full).user.js
// ==/UserScript==

(async function () {
    'use strict';
    const url = window.location.href;
    let recentList = GM_getValue("recentForums", []);
    function getCookie(name) {
        const c = document.cookie.split('; ').find(c => c.startsWith(name + '='));
        if (!c) return null;
        return decodeURIComponent(c.split('=')[1]);
    }
    const mode = getCookie('ckTheme') ? 'dark' : 'light';
    function createOverlay() {
        if (document.getElementById('tm-integer-overlay')) return;
        let recent = GM_getValue("recent", 10);
        const theme = {
            dark: {
                overlayBg: 'rgba(0,0,0,0.7)',
                boxBg: '#1e1e1e',
                textColor: '#fff',
                inputBg: '#333',
                inputText: '#fff',
            },
            light: {
                overlayBg: 'rgba(0,0,0,0.5)',
                boxBg: '#fff',
                textColor: '#000',
                inputBg: '#fff',
                inputText: '#000',
            }
        };
        const colors = theme[mode];
        const overlay = document.createElement('div');
        overlay.id = 'tm-integer-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: colors.overlayBg,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '999999',
            fontFamily: '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Heiti TC", sans-serif',
        });
        const box = document.createElement('div');
        Object.assign(box.style, {
            backgroundColor: colors.boxBg,
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '250px',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            color: colors.textColor,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        });
        const label = document.createElement('div');
        label.textContent = '輸入顯示數量(1-30):';
        label.style.marginBottom = '10px';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '30';
        input.value = recent;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.addEventListener('keypress', e => {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
        input.addEventListener('paste', e => {
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (!/^\d+$/.test(paste)) {
                e.preventDefault();
            }
        });
        Object.assign(input.style, {
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            backgroundColor: colors.inputBg,
            color: colors.inputText,
            outline: 'none',
        });
        const btn = document.createElement('button');
        btn.textContent = '確認';
        Object.assign(btn.style, {
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#11aac1',
            color: '#fff',
            cursor: 'pointer',
            alignSelf: 'center'
        });
        btn.onmouseenter = () => { btn.style.backgroundColor = '#117e96'; }
        btn.onmouseleave = () => { btn.style.backgroundColor = '#11aac1'; }
        const errorMsg = document.createElement('div');
        Object.assign(errorMsg.style, {
            color: 'red',
            marginTop: '5px',
            fontSize: '14px',
            height: '18px',
            textAlign: 'center'
        });
        btn.onclick = () => {
            const val = parseInt(input.value, 10);
            if (isNaN(val) || val < 1 || val > 30) {
                errorMsg.textContent = '請輸入1-30的數字';
            } else {
                GM_setValue("recent", val);
                overlay.remove();
            }
        };
        box.appendChild(label);
        box.appendChild(input);
        box.appendChild(btn);
        box.appendChild(errorMsg);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }
    GM_registerMenuCommand("更改顯示數量", createOverlay);
    const raw = getCookie('ckBH_lastBoard');
    if (!raw) return console.warn("!ckBH_lastBoard");
    let list;
    try {
        list = JSON.parse(raw);
    } catch (e) {
        console.error(e);
        return;
    }
    function getBoardImage(bsn, queryClass) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://forum.gamer.com.tw/A.php?bsn=${bsn}`,
                onload(res) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(res.responseText, 'text/html');
                        const imgTag = doc.querySelector(queryClass);
                        resolve(imgTag ? imgTag.src : '');
                    } catch (e) { resolve(''); }
                },
                onerror() { resolve(''); }
            });
        });
    }
    function validURL(bsn, url, type) {
        return new Promise(resolve => {
            const img = new Image();
            const testUrl = url + (url.includes("?") ? "&" : "?") + "_cb=" + Date.now();
            img.onload = () => {
                if (img.naturalWidth > 0) resolve(url);
                else resolve(getBoardImage(bsn, type));
            }
            img.onerror = () => resolve(getBoardImage(bsn, type));
            img.src = testUrl;
        });
    }
    async function addRecentEntry(bsn, name) {
        let recent = GM_getValue("recentForums", []);
        let newEntry = { bsn: bsn, name: name };
        const [src, srcWelcome] = await Promise.all([
            getBoardImage(bsn, 'div.FM-abox6B a img'),
            getBoardImage(bsn, 'div.FM-abox1.tippy-abox a img')
        ]);
        newEntry.src = src;
        newEntry.srcWelcome = srcWelcome;
        recent = recent.filter(entry => entry.bsn !== bsn);
        recent.unshift(newEntry);
        if (recent.length > 30) {
            recent = recent.slice(0, 30);
        }
        GM_setValue("recentForums", recent);
    }
    async function cookiesToStorage(bsn, name) {
        let newEntries = await Promise.all(
            list.map(async ([bsn, name]) => {
                const [src, srcWelcome] = await Promise.all([
                    getBoardImage(bsn, 'div.FM-abox6B a img'),
                    getBoardImage(bsn, 'div.FM-abox1.tippy-abox a img')
                ]);
                return { bsn, name, src, srcWelcome };
            })
        );
        newEntries.forEach(entry => {
            recentList = recentList.filter(e => e.bsn !== entry.bsn);
            recentList.push(entry);
        });
        GM_setValue("recentForums", recentList);
    }
    let check = false;
    if (recentList.length === 0) await cookiesToStorage()
    else if (list && !(url.startsWith("https://www.gamer.com.tw/") || url === 'https://forum.gamer.com.tw/' || url.startsWith("https://forum.gamer.com.tw/?c="))) {
        await addRecentEntry(list[0][0], list[0][1]);
    }
    else check = true;
    list = GM_getValue("recentForums", []);
    if (!list) return console.warn("cookies list empty");
    let val = GM_getValue("recent", null);
    if (!val) {
        val = 10;
        GM_setValue("recent", val);
    }
    async function updateURL() {
        let newEntries = await Promise.all(
            list.map(async ({bsn, name, src = '', srcWelcome = ''}) => {
                const [newSrc, newSrcWelcome] = await Promise.all([
                    !src?src:validURL(bsn, src, 'div.FM-abox6B a img'),
                    !srcWelcome?srcWelcome:validURL(bsn, srcWelcome, 'div.FM-abox1.tippy-abox a img')
                ]);
                return { bsn, name, src: newSrc, srcWelcome: newSrcWelcome };
            })
        );
        list = [];
        newEntries.forEach(entry => {
            list = list.filter(e => e.bsn !== entry.bsn);
            list.push(entry);
        });
        GM_setValue("recentForums", list);
    }
    if (check) await updateURL();
    if (url.startsWith("https://www.gamer.com.tw/")) {
        function buildList() {
            const ul = document.querySelector('#boardHistory');
            if (!ul) return console.warn("no boardHistory");
            if (ulObserver) ulObserver.disconnect();
            ul.innerHTML = '';
            val = GM_getValue("recent", 10);
            for (const { bsn, name, src = '', srcWelcome = '' } of list) {
                if (val-- === 0) break;
                const li = document.createElement('li');
                li.className = 'sidenav-section__item';
                const a = document.createElement('a');
                a.className = 'sidenav-section__link link-item';
                a.href = 'https://forum.gamer.com.tw/B.php?bsn=' + bsn;
                a.dataset.collapseTippy = name;
                a.dataset.gtmArea = '最近閱覽';
                a.dataset.gtmLinkClick = '點擊哈啦板'
                a.dataset.gtmPage = '新首頁';
                a.dataset.gtmService = 'forum';
                a.dataset.gtmVar1 = bsn;
                const div = document.createElement('div');
                div.className = 'sidenav-section__content';
                const img = document.createElement('img');
                img.className = 'sidenav-section__img';
                img.src = src || srcWelcome || '';
                img.loading = 'lazy';
                const p = document.createElement('p');
                p.className = 'sidenav-section__name';
                p.textContent = name;
                div.appendChild(img);
                div.appendChild(p);
                a.appendChild(div);
                li.appendChild(a);
                ul.appendChild(li);
            };
            ulObserver.observe(ul, { childList: true, subtree: true });
        }
        const ul = document.querySelector('#boardHistory');
        const ulObserver = new MutationObserver(buildList);
        ulObserver.observe(ul, { childList: true, subtree: true });
        buildList();
    }
    else if (url === 'https://forum.gamer.com.tw/' || url.startsWith("https://forum.gamer.com.tw/?c=")) {
        const target = document.querySelector('.relative.transition-all.Aside_section__QYARK.px-3');
        function buildlist() {
            const target2 = target.querySelector('div[class=""]');
            const targetSmall = document.querySelector('.relative.transition-all.Aside_section__QYARK:not(.px-3)');
            if (!targetSmall) return console.warn("no small side panel");
            const target2Small = targetSmall.querySelector('div[class=""]');
            if (!target2 || !target2Small) return console.warn("no recent list");
            if (observer) observer.disconnect();
            target2.innerHTML = '';
            target2Small.innerHTML = '';
            val = GM_getValue("recent", 10);
            for (const { bsn, name, src = '', srcWelcome = '' } of list) {
                if (val-- === 0) break;
                const span = document.createElement('span');
                const a = document.createElement('a');
                a.href = 'https://forum.gamer.com.tw/B.php?bsn=' + bsn;
                a.className = 'baha-duration-300 baha-ease-out baha-select-none baha-cursor-pointer baha-text-sm hover:baha-text-primary baha-text-secondary-text myBoard_boardItem__wyod_';
                a.tabIndex = -1;
                const img = document.createElement('img');
                img.className = 'myBoard_boardImage__Oa5K_ mr-2'
                img.alt = name;
                img.src = srcWelcome || src || '';
                img.loading = 'lazy';
                const innerSpan = document.createElement('span');
                innerSpan.className = 'line-clamp-2 leading-tight'
                innerSpan.innerHTML = name;
                a.append(img);
                a.append(innerSpan);
                span.append(a);
                target2.append(span);
                const spanClone = span.cloneNode(true);
                const aClone = spanClone.querySelector('a');
                const imgClone = aClone.querySelector('img');
                imgClone.className = 'myBoard_boardImage__Oa5K_';
                const innerSpanClone = aClone.querySelector('span');
                innerSpanClone.className = 'line-clamp-2 leading-tight !hidden';
                target2Small.append(spanClone);
                tippy(spanClone, {
                    content: name,
                    theme: mode,
                    placement: 'right',
                    animation: 'fade',
                    maxWidth: 350,
                });
            };
            observer.observe(target, { childList: true, subtree: true });
        };
        const observer = new MutationObserver(buildlist);
        observer.observe(target, { childList: true, subtree: true });
        buildlist();
    }
})();