package main

import (
	"encoding/base64"
)

// We use a baked in loading animation to reduce visual flash and improve
// perceived performance while the service loads and assets are loaded.
// Inlined data URIs like this load instantly as there are no external assets
// to load and it's very lightweight. This looks best when there is a smooth
// transition between this animation and loading animation in the web app.
func LoadUrl(url string) string {
	html := `
<html>
  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <style>
      :root {
        --color-default-primary-r: 250;
        --color-default-primary-g: 135;
        --color-default-primary-b: 0;
        --color-default-primary-dark-modifier: 200;

        --color-primary-r: var(--color-default-primary-r);
        --color-primary-g: var(--color-default-primary-g);
        --color-primary-b: var(--color-default-primary-b);
        --color-primary-dark-modifier: var(--color-default-primary-dark-modifier);

        --color-primary-dark-r: calc(var(--color-primary-r) - var(--color-primary-dark-modifier));
        --color-primary-dark-g: calc(var(--color-primary-g) - var(--color-primary-dark-modifier));
        --color-primary-dark-b: calc(var(--color-primary-b) - var(--color-primary-dark-modifier));

        --color-primary: rgb(var(--color-primary-r), var(--color-primary-g), var(--color-primary-b));
        --color-primary-dark: rgb(var(--color-primary-dark-r), var(--color-primary-dark-g), var(--color-primary-dark-b));
      }

      html {
        zoom: 100%;
      }

      .not-selectable {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      html::after {
        content: " ";
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
        z-index: -1;
        background-size: 100% 10px;
        pointer-events: none;
      }

      body {
        background: black;
        color: white;
        font-size: 1.5rem;
        padding: .5rem;
        margin: 0;
        text-align: center;
        zoom: 0.8;
      }

      html,
      body {
        -ms-content-zooming: none;
      }

      #background {
        position: absolute !important;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: " ";
        background: radial-gradient(circle, var(--color-primary-dark) 0%, rgba(0, 0, 0, 1) 100%);
        z-index: -1;
        opacity: 0.8;
      }

      #loader {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: .75;
        zoom: 1.5;
        transition: .25s ease-in-out;
        z-index: 100;
        pointer-events: none;
        margin-top: -2.5rem;
        text-align: center;
      }

      .loader__row {
        display: flex;
      }

      .loader__arrow {
        width: 0;
        height: 0;
        margin: 0 -6px;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 21.6px solid var(--color-primary);
        animation: loader__arrow-blink 1s infinite;
        filter: drop-shadow(0 0 18px var(--color-primary));
      }

      .loader__arrow--down {
        transform: rotate(180deg);
      }

      .loader__arrow--outer-1 {
        animation-delay: -0.0555555556s;
      }

      .loader__arrow--outer-2 {
        animation-delay: -0.1111111111s;
      }

      .loader__arrow--outer-3 {
        animation-delay: -0.1666666667s;
      }

      .loader__arrow--outer-4 {
        animation-delay: -0.2222222222s;
      }

      .loader__arrow--outer-5 {
        animation-delay: -0.2777777778s;
      }

      .loader__arrow--outer-6 {
        animation-delay: -0.3333333333s;
      }

      .loader__arrow--outer-7 {
        animation-delay: -0.3888888889s;
      }

      .loader__arrow--outer-8 {
        animation-delay: -0.4444444444s;
      }

      .loader__arrow--outer-9 {
        animation-delay: -0.5s;
      }

      .loader__arrow--outer-10 {
        animation-delay: -0.5555555556s;
      }

      .loader__arrow--outer-11 {
        animation-delay: -0.6111111111s;
      }

      .loader__arrow--outer-12 {
        animation-delay: -0.6666666667s;
      }

      .loader__arrow--outer-13 {
        animation-delay: -0.7222222222s;
      }

      .loader__arrow--outer-14 {
        animation-delay: -0.7777777778s;
      }

      .loader__arrow--outer-15 {
        animation-delay: -0.8333333333s;
      }

      .loader__arrow--outer-16 {
        animation-delay: -0.8888888889s;
      }

      .loader__arrow--outer-17 {
        animation-delay: -0.9444444444s;
      }

      .loader__arrow--outer-18 {
        animation-delay: -1s;
      }

      .loader__arrow--inner-1 {
        animation-delay: -0.1666666667s;
      }

      .loader__arrow--inner-2 {
        animation-delay: -0.3333333333s;
      }

      .loader__arrow--inner-3 {
        animation-delay: -0.5s;
      }

      .loader__arrow--inner-4 {
        animation-delay: -0.6666666667s;
      }

      .loader__arrow--inner-5 {
        animation-delay: -0.8333333333s;
      }

      .loader__arrow--inner-6 {
        animation-delay: -1s;
      }

      @keyframes loader__arrow-blink {
        0% {
          opacity: 0.1;
        }

        30% {
          opacity: 1;
        }

        100% {
          opacity: 0.1;
        }
      }
    </style>
  </head>
  <body oncontextmenu="return false;" class="not-selectable">
		<div id="background"></div>
    <div id="loader">
      <div class="loader__row">
        <div class="loader__arrow loader__arrow--outer-18"></div>
        <div class="loader__arrow loader__arrow--down lloader__arrow--outer-17"></div>
        <div class="loader__arrow loader__arrow--outer-16"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-15"></div>
        <div class="loader__arrow loader__arrow--outer-14"></div>
      </div>
      <div class="loader__row">
        <div class="loader__arrow loader__arrow--outer-1"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-2"></div>
        <div class="loader__arrow loader__arrow--inner-6"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--inner-5"></div>
        <div class="loader__arrow loader__arrow--inner-4"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-13"></div>
        <div class="loader__arrow loader__arrow--outer-12"></div>
      </div>
      <div class="loader__row">
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-3"></div>
        <div class="loader__arrow loader__arrow--outer-4"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--inner-1"></div>
        <div class="loader__arrow loader__arrow--inner-2"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--inner-3"></div>
        <div class="loader__arrow loader__arrow--outer-11"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-10"></div>
      </div>
      <div class="loader__row">
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-5"></div>
        <div class="loader__arrow loader__arrow--outer-6"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-7"></div>
        <div class="loader__arrow loader__arrow--outer-8"></div>
        <div class="loader__arrow loader__arrow--down loader__arrow--outer-9"></div>
      </div>
    </div>
  </body>
	<script>setTimeout(() => window.location.href = "` + url + `", 0)</script>
</html>
`
	return `data:text/html;base64,` + base64.StdEncoding.EncodeToString([]byte(html))
}
