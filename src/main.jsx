import { StrictMode } from 'react'
import { version } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ExamplePage from './pages/ExamplePage.jsx'
const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    {/* <App /> */}
    {ExamplePage}
  </StrictMode>,
  // <App />
)
console.info(root)
console.info(version)

// import React from "react";
// import ReactDOM from "react-dom";

// const root = document.querySelector("#root");
// const Child = (props) => {
//     return <span>{props.text}</span>;
// };
// const App = () => (
//     <h1>
//         {/* <span>test-mini-react</span> */}
//         <Child text="Hello, World!" />
//     </h1>
// );

// ReactDOM.createRoot(root).render(<App />);

// console.info(React);
// console.info(App());
// console.info(ReactDOM);
