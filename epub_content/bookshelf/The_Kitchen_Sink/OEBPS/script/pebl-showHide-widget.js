var globalPebl="object"==typeof globalPebl?globalPebl:{};globalPebl.extension=globalPebl.extension||{},globalPebl.extension.PeblShowHideWidget=function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/dist/",i(i.s=4)}([function(t,e){t.exports=Vue},function(t,e,i){var n=i(2);"string"==typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);(0,i(5).default)("917b5598",n,!0,{})},function(t,e,i){(t.exports=i(3)(!1)).push([t.i,".showHideButton{display:flex;align-items:center;justify-content:flex-start;min-width:100%;cursor:pointer;-webkit-border-radius:5;-moz-border-radius:5;border-radius:5px;outline:none !important;background-color:#ffffff;color:var(--secondary-color);text-decoration:none;margin:.5em 0em;border:none;position:relative;font-size:2em;padding:0;clear:both;width:40px;height:40px;overflow:hidden;break-inside:avoid-column;-webkit-column-break-inside:avoid}.showHideButton:active,.showHideButton:focus,.showHideButton:hover{background-color:white !important}.showHideButton.text i{margin-left:0;text-align:left}.showHideButton.text span{margin-left:1em}.showHideButton.text{padding:.5rem;font-weight:400;height:auto;background:#fff;min-width:100%;text-align:left;color:var(--secondary-color);outline:none;width:auto;font-size:1.2em}.showHideButton.hiding{color:var(--secondary-color-light) !important;font-weight:400 !important;background-color:#fff !important}.showHideButton.text:hover,.showHideButton.text:active,.showHideButton.text:focus{text-decoration:none;color:var(--secondary-color-dark);background-color:#fff !important;font-weight:500}.showHideButton.inline{float:none !important;margin-bottom:0 !important}.userToggled{min-width:100%;padding:0rem 0rem 1rem 0rem}\n",""])},function(t,e){t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var i=function(t,e){var i=t[1]||"",n=t[3];if(!n)return i;if(e&&"function"==typeof btoa){var o=(a=n,"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(a))))+" */"),r=n.sources.map((function(t){return"/*# sourceURL="+n.sourceRoot+t+" */"}));return[i].concat(r).concat([o]).join("\n")}var a;return[i].join("\n")}(e,t);return e[2]?"@media "+e[2]+"{"+i+"}":i})).join("")},e.i=function(t,i){"string"==typeof t&&(t=[[null,t,""]]);for(var n={},o=0;o<this.length;o++){var r=this[o][0];"number"==typeof r&&(n[r]=!0)}for(o=0;o<t.length;o++){var a=t[o];"number"==typeof a[0]&&n[a[0]]||(i&&!a[2]?a[2]=i:i&&(a[2]="("+a[2]+") and ("+i+")"),e.push(a))}},e}},function(t,e,i){"use strict";i.r(e),i.d(e,"insertExtensions",(function(){return l})),i.d(e,"resetExtension",(function(){return u})),i.d(e,"disable",(function(){return h})),i.d(e,"enable",(function(){return c})),i.d(e,"createShowHide",(function(){return f}));i(1);var n=i(0),o=i.n(n);var r=function(t,e,i,n,o,r,a,s){var d=typeof(t=t||{}).default;"object"!==d&&"function"!==d||(t=t.default);var l,u="function"==typeof t?t.options:t;if(e&&(u.render=e,u.staticRenderFns=i,u._compiled=!0),n&&(u.functional=!0),r&&(u._scopeId=r),a?(l=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),o&&o.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(a)},u._ssrRegister=l):o&&(l=s?function(){o.call(this,this.$root.$options.shadowRoot)}:o),l)if(u.functional){u._injectStyles=l;var h=u.render;u.render=function(t,e){return l.call(e),h(t,e)}}else{var c=u.beforeCreate;u.beforeCreate=c?[].concat(c,l):[l]}return{exports:t,options:u}}(o.a.extend({name:"Widget",props:["eventBus","globalPebl","globalReadium","insertID","showText","hideText","id","inline","defaultState","propertiesObject","authoringId"],mounted(){this.reset(),this.eventBus.$on("disable",()=>{this.disable()}),this.eventBus.$on("enable",()=>{this.enable()}),this.eventBus.$on("reset",()=>{this.reset()})},computed:{buttonText:function(){return this.hiding?this.showText:this.hideText}},data:()=>({brTag:"<br/>",hiding:!1,enabled:!0}),methods:{disable:function(){this.enabled=!1,jQuery("."+this.id+", #"+this.id).css("display","block")},enable:function(){this.enabled=!0},reset:function(){"hidden"===this.defaultState?(this.hiding=!0,jQuery("."+this.id+", #"+this.id).css("display","none").addClass("peblShowHide-hidden")):(this.hiding=!1,jQuery("."+this.id+", #"+this.id).css("display","block").addClass("peblShowHide-shown"))},toggleVisibility:function(){this.enabled&&(this.hiding?(this.hiding=!1,jQuery("."+this.id+", #"+this.id).attr("role","alert"),jQuery("."+this.id+", #"+this.id).slideDown(400,()=>{jQuery("."+this.id+", #"+this.id).css("display","block").addClass("peblShowHide-shown"),this.globalReadium&&null!=this.globalReadium.reader.plugins.highlights&&this.globalReadium.reader.plugins.highlights.redrawAnnotations(),this.globalPebl.emitEvent(this.globalPebl.events.eventShowed,{activityType:"show-hide",activityId:this.insertID,type:"showHide"})})):(this.hiding=!0,jQuery("."+this.id+", #"+this.id).slideUp(400,()=>{jQuery("."+this.id+", #"+this.id).css("display","none").addClass("peblShowHide-hidden"),this.globalReadium&&null!=this.globalReadium.reader.plugins.highlights&&this.globalReadium.reader.plugins.highlights.redrawAnnotations(),this.globalPebl.emitEvent(this.globalPebl.events.eventHid,{activityType:"show-hide",activityId:this.insertID,type:"showHide"})})))}}}),(function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{attrs:{"data-theme-target":t.insertID,contenteditable:"false","data-authoringid":t.authoringId,"data-propertiesobject":t.propertiesObject}},[i("button",{staticClass:"showHideButton",class:{hiding:t.hiding,inline:t.inline},attrs:{otherId:t.id,"data-trackingId":t.insertID},on:{click:t.toggleVisibility}},[i("i",{staticClass:"fa",class:{"fa-plus-circle":t.hiding,"fa-minus-circle":!t.hiding}}),t._v(" "),t.showText&&t.hideText?i("span",{staticClass:"text"},[t._v(t._s(t.buttonText))]):t._e()])])}),[],!1,null,null,null).exports,a=window.parent&&window.parent.PeBL?window.parent.PeBL:window.PeBL?window.PeBL:null,s=window.parent.READIUM,d=new o.a({});function l(){jQuery('.showHide_showHideExtension, .peblExtension[data-peblExtension="showHide"], .peblExtension[data-peblextension="showHide"]').each((function(){var t=this.getAttribute("id"),e=this.hasAttribute("data-buttonText1")?this.getAttribute("data-buttonText1"):this.getAttribute("data-buttontext1"),i=this.hasAttribute("data-buttonText2")?this.getAttribute("data-buttonText2"):this.getAttribute("data-buttontext2"),n=this.getAttribute("data-id"),o=!1;this.hasAttribute("data-displayBtnInline")&&"true"==this.getAttribute("data-displayBtnInline")&&(o=!0),this.hasAttribute("data-displaybtninline")&&"true"===this.getAttribute("data-displaybtninline")&&(o=!0);var r=this.hasAttribute("data-defaultState")?this.getAttribute("data-defaultState"):"hidden";this.hasAttribute("data-defaultstate")&&(r=this.getAttribute("data-defaultstate")),f('[id="'+t+'"]',t,e,i,n,o,r,this.hasAttribute("data-propertiesobject")?this.getAttribute("data-propertiesobject"):void 0,this.hasAttribute("data-authoringid")?this.getAttribute("data-authoringid"):void 0)}))}function u(){d.$emit("reset")}function h(){d.$emit("disable")}function c(){d.$emit("enable")}function f(t,e,i,n,l,u,h,c,f){new o.a({el:t,render:t=>t(r,{props:{eventBus:d,globalPebl:a,globalReadium:s,insertID:e,showText:i,hideText:n,id:l,inline:u,defaultState:h,propertiesObject:c,authoringId:f}})})}jQuery(document).ready(()=>{window.parent.PeBLConfig&&window.parent.PeBLConfig.isAuthoring?document.addEventListener("pebleditorready",()=>{l()}):l()})},function(t,e,i){"use strict";function n(t,e){for(var i=[],n={},o=0;o<e.length;o++){var r=e[o],a=r[0],s={id:t+":"+o,css:r[1],media:r[2],sourceMap:r[3]};n[a]?n[a].parts.push(s):i.push(n[a]={id:a,parts:[s]})}return i}i.r(e),i.d(e,"default",(function(){return f}));var o="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!o)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var r={},a=o&&(document.head||document.getElementsByTagName("head")[0]),s=null,d=0,l=!1,u=function(){},h=null,c="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function f(t,e,i,o){l=i,h=o||{};var a=n(t,e);return p(a),function(e){for(var i=[],o=0;o<a.length;o++){var s=a[o];(d=r[s.id]).refs--,i.push(d)}e?p(a=n(t,e)):a=[];for(o=0;o<i.length;o++){var d;if(0===(d=i[o]).refs){for(var l=0;l<d.parts.length;l++)d.parts[l]();delete r[d.id]}}}}function p(t){for(var e=0;e<t.length;e++){var i=t[e],n=r[i.id];if(n){n.refs++;for(var o=0;o<n.parts.length;o++)n.parts[o](i.parts[o]);for(;o<i.parts.length;o++)n.parts.push(g(i.parts[o]));n.parts.length>i.parts.length&&(n.parts.length=i.parts.length)}else{var a=[];for(o=0;o<i.parts.length;o++)a.push(g(i.parts[o]));r[i.id]={id:i.id,refs:1,parts:a}}}}function b(){var t=document.createElement("style");return t.type="text/css",a.appendChild(t),t}function g(t){var e,i,n=document.querySelector('style[data-vue-ssr-id~="'+t.id+'"]');if(n){if(l)return u;n.parentNode.removeChild(n)}if(c){var o=d++;n=s||(s=b()),e=y.bind(null,n,o,!1),i=y.bind(null,n,o,!0)}else n=b(),e=w.bind(null,n),i=function(){n.parentNode.removeChild(n)};return e(t),function(n){if(n){if(n.css===t.css&&n.media===t.media&&n.sourceMap===t.sourceMap)return;e(t=n)}else i()}}var v,m=(v=[],function(t,e){return v[t]=e,v.filter(Boolean).join("\n")});function y(t,e,i,n){var o=i?"":n.css;if(t.styleSheet)t.styleSheet.cssText=m(e,o);else{var r=document.createTextNode(o),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(r,a[e]):t.appendChild(r)}}function w(t,e){var i=e.css,n=e.media,o=e.sourceMap;if(n&&t.setAttribute("media",n),h.ssrId&&t.setAttribute("data-vue-ssr-id",e.id),o&&(i+="\n/*# sourceURL="+o.sources[0]+" */",i+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),t.styleSheet)t.styleSheet.cssText=i;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(i))}}}]);