package main

import ("encoding/base64")

func LoadUrl(url string) string {
	html := `
<html>
  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <style>
      :root {
        --primary-color: rgb(235, 125, 0);
        --dark-primary-color: rgb(58, 12, 0);
				--background-color: var(--dark-primary-color);
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
        background: radial-gradient(circle, var(--background-color) 0%, rgba(0, 0, 0, 1) 100%);
        z-index: -1;
        opacity: 0.8;
      }

      #loader {
        position: absolute;
        top: 25%;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 1em;
        zoom: 2;
        opacity: .75;
        transition: .25s ease-in-out;
        z-index: 1;
        pointer-events: none;
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
        border-bottom: 21.6px solid var(--primary-color);
        animation: loader__arrow-blink 1s infinite;
        filter: drop-shadow(0 0 18px var(--primary-color));
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
  <body oncontextmenu="return false;" class="not-selectable scrollable">
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
    <div id="background"></div>
  </body>
	<script>setTimeout(() => window.location.href = "`+url+`", 0)</script>
</html>
`
	return `data:text/html;base64,`+base64.StdEncoding.EncodeToString([]byte(html))
}