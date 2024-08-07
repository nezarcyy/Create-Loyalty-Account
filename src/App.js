import RegistrationForm from "./components/RegistrationForm";
import Header from "./components/ui/header";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="">
        <RegistrationForm />
      </main>
    </div>
  );
}

export default App;