// simple init script that allows us to work with webpack OR our existing
// typescript functionality with Electron.


function injectApp(scriptSrc, fallbackLoader) {

  if (typeof require === 'function') {
      console.log("Loading via fallbackLoader");
      fallbackLoader();
  } else {
      console.log("Loading via script");
      injectScript(scriptSrc);
  }

}

function injectScript(src, type) {

  const script = document.createElement('script');
  script.src = src;

  script.async = false;
  script.defer = false;

  if (type) {
      script.type = type;
  }

  document.documentElement.appendChild(script);

}

