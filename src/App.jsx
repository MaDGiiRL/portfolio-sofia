import { Routing } from "./routes/Routing";
import './i18n';
import SessionProvider from "./context/SessionProvider";
function App() {
  return (
    <SessionProvider>
      <Routing />
    </SessionProvider>
  );
}

export default App;
