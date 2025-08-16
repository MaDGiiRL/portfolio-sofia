import './i18n';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import "bootstrap-icons/font/bootstrap-icons.css"
import './style/index.css'
import './style/skills.css'
import './style/discordbanner.css'
import './style/login.css'
import './style/cvcard.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
