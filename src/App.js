import './App.css';

import Botd from '@fpjs-incubator/botd-agent';
import { Component } from 'react';

const publicKey = process.env.REACT_APP_BOT_D_API_KEY;

// Initialize an agent at application startup.
const botdPromise = Botd.load({ publicKey });

class App extends Component {

  async componentDidMount() {
    document.title = 'Bot Detector';

    function isBot(result) {
      return [...Object.entries(result.bot)].some(([k, tool]) => tool.probability > 0);
    }
    async function run() {
      // Get the bot detection result when you need it.
      // Result will contain the `requestId` property, that you can securely verify on the server.

      try {
        const botd = await botdPromise;

        const detectResponse = await botd.detect();

        const botdServerAPI = "https://botd.fpapi.io/api/v1"
        const verifyBody = JSON.stringify({
          "secretKey": "4KJ729bvzHGuKEqhDKNIKfos",
          "requestId": detectResponse.requestId
        })
        const result = await fetch(`${botdServerAPI}/verify`, {
          body: verifyBody,
          method: "POST"
        })
          .then(response => response.json())

        console.log(result);
        const notDetected = "Not detected by bot ✅";
        const detected = "Error: you are a bot!";
        document.getElementById("status").textContent = isBot(result) ? detected : notDetected;
        document.getElementById("result-table").innerHTML = [...Object.entries(result.bot), ["vm", result.vm]].map(([key, value]) => {
          let style = value.status === "processed" ?
            value.probability > 0 ? { class: "green", innerHTML: `<b>detected</b> (probability ${value.probability.toFixed(2)})` }
              : { class: "", innerHTML: "not detected" }
            : { class: "red", innerHTML: `<b>${value.status}</b>` };
          return `<tr><td style="width: 25%">${key}</td><td class="${style.class}">${style.innerHTML}</td><td>${value.type || ""}</td></tr>`;
        }).join("");
      } catch (e) {
        console.error(e);
        // document.getElementById("result_section").style.display = "none"
        // document.getElementById("error_section").style.display = "block"
        document.getElementById("status").textContent = "Error!";
        // document.getElementById("error").textContent = JSON.stringify(e, null, 4);
      }

    }

    await run()
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 id="status">Loading...</h1>
          <table id="result-table"> </table>
        </header>
      </div>
    );
  }
}

export default App;
