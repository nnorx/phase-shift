import { GradientStudio } from "./components/GradientStudio";
import { Toaster } from "./components/ui/sonner";

function App() {
	return (
		<>
			<GradientStudio />
			<Toaster position="bottom-right" richColors />
		</>
	);
}

export default App;
