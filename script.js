var host = "localhost:3000";
var config = {
  ws_url: `ws://${host}/ws`,
  get_nodes_url: `http://${host}/nodes`,
  run_consensus_url: `http://${host}/set`,
};

function init() {
  //connect to websocket
  let ws = new WebSocket(config.ws_url);
  ws.addEventListener("message", function (e) {
    //on each message, reset the changing color
    let msg = JSON.parse(e.data); //see message in ws_message_sample.json
    if (msg.type == 4) {
      document.getElementById(msg.address).style.backgroundColor =
        msg.data.color;
    }
  });
}
init();

var state = {
  term: 1,
  choice: {},
};
var network = document.getElementById("network");
var result = document.getElementById("result");
var term = document.getElementById("term");
var rowSize = 10;
function reset() {
  //clear nodes and state
  network.innerHTML = "";
  state.choice = {};
  term.innerHTML = state.term;
  result.innerHTML = "";
  //call http to generate
  axios.get(config.get_nodes_url).then(function (response) {
    let nodes = response.data;
    console.log(nodes);
    for (let i = 0; i < nodes.length; i++) {
      //make row containing rowSize elements each
      let rowId = "row" + Math.floor(i / rowSize);
      if (i % rowSize == 0) {
        let row = document.createElement("div");
        row.setAttribute("id", rowId);
        row.setAttribute("class", "row");
        network.appendChild(row);
      }
      let cell = document.createElement("div");
      cell.setAttribute("id", nodes[i]);
      cell.setAttribute("class", "cell");
      cell.innerHTML = nodes[i].replace("127.0.0.1:", "");

      //onclick, toggle background color
      cell.addEventListener("click", function () {
        let currentBg = cell.style.backgroundColor;
        if (currentBg == "") {
          let randomColor =
            "#" + Math.floor(Math.random() * 16777215).toString(16);
          cell.style.backgroundColor = randomColor;
          state.choice[nodes[i]] = randomColor;
        } else {
          cell.style.backgroundColor = "";
          state.choice[nodes[i]] = undefined;
        }
      });
      document.getElementById(rowId).appendChild(cell);
    }
  });
}
reset();

function run() {
  //call http to set choice
  axios
    .post(config.run_consensus_url, state)
    .then(function (response) {
      console.log(response);
      state.term++;
      state.choice = {};
      result.innerHTML = response.data;
      term.innerHTML = state.term;
    })
    .catch((e) => {
      console.log(e);
      result.innerHTML = e;
    });
}
