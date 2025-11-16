// ==UserScript==
// @name         巴哈姆特顯示全部最近閱覽
// @namespace    http://tampermonkey.net/
// @version      1.1(full)
// @author       Johnson8033
// @description  在原本位置增加全部最近閱覽
// @match        https://www.gamer.com.tw/*
// @match        https://forum.gamer.com.tw/
// @include      https://forum.gamer.com.tw/?c=*
// @icon         https://i2.bahamut.com.tw/favicon.svg?v=1689129528
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    const url = window.location.href;
    function getCookie(name) {
        const c = document.cookie.split('; ').find(c => c.startsWith(name + '='));
        if (!c) return null;
        return decodeURIComponent(c.split('=')[1]);
    }
    const raw = getCookie('ckBH_lastBoard');
    if (!raw) return console.warn("!ckBH_lastBoard");
    let list;
    try {
        list = JSON.parse(raw);
    } catch(e) {
        console.error(e);
        return;
    }
    function getBoardImage(bsn) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://forum.gamer.com.tw/A.php?bsn=${bsn}`,
                onload(res) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(res.responseText, 'text/html');
                        if (url.includes("www.gamer.com.tw")){
                            const imgTag = doc.querySelector('div.FM-abox6B a img');
                            if (imgTag) resolve(imgTag.src);
                        }
                        const imgTag2 = doc.querySelector('div.FM-abox1.tippy-abox a img');
                        resolve(imgTag2 ? imgTag2.src : '');
                    } catch(e) { resolve(''); }
                },
                onerror() { resolve(''); }
            });
        });
    }
    if (url.includes("www.gamer.com.tw")){
        function buildList() {
            const ul = document.querySelector('#boardHistory');
            if (!ul) return;
            if (ulObserver) ulObserver.disconnect();
            console.log("DO");
            ul.innerHTML = '';
            list.forEach(([bsn, name]) => {
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
                getBoardImage(bsn).then(src => { img.src = src });
                img.loading = 'lazy';
                const p = document.createElement('p');
                p.className = 'sidenav-section__name';
                p.textContent = name;
                div.appendChild(img);
                div.appendChild(p);
                a.appendChild(div);
                li.appendChild(a);
                ul.appendChild(li);
            });
            ulObserver.observe(ul, { childList: true, subtree: true });
        }
        const ul = document.querySelector('#boardHistory');
        const ulObserver = new MutationObserver(buildList);
        ulObserver.observe(ul, { childList: true, subtree: true });
        buildList();
    }
    else if (url.includes('forum.gamer.com.tw')){
        const target = document.querySelector('.relative.transition-all.Aside_section__QYARK.px-3');
        const config = { childList: true, subtree: true };
        function buildlist (){
            const target2 = target.querySelector('div[class=""]');
            const targetSmall = document.querySelector('.relative.transition-all.Aside_section__QYARK:not(.px-3)');
            if (!targetSmall) return;
            const target2Small = targetSmall.querySelector('div[class=""]');
            if (!target2 || !target2Small) return;
            if (observer) observer.disconnect();
            target2.innerHTML = '';
            target2Small.innerHTML = '';
            list.forEach(([bsn, name]) => {
                const span = document.createElement('span');
                const a = document.createElement('a');
                a.href = 'https://forum.gamer.com.tw/B.php?bsn=' + bsn;
                a.className = 'baha-duration-300 baha-ease-out baha-select-none baha-cursor-pointer baha-text-sm hover:baha-text-primary baha-text-secondary-text myBoard_boardItem__wyod_';
                a.tabIndex = -1;
                const img = document.createElement('img');
                img.className = 'myBoard_boardImage__Oa5K_ mr-2'
                img.alt = name;
                getBoardImage(bsn).then(src => { img.src = src });
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
                getBoardImage(bsn).then(src => { imgClone.src = src });
                const innerSpanClone = aClone.querySelector('span');
                innerSpanClone.className = 'line-clamp-2 leading-tight !hidden';
                target2Small.append(spanClone);
            });
            observer.observe(target, config);
        };
        const observer = new MutationObserver(buildlist);
        observer.observe(target, config);
        buildlist();
    }
})();